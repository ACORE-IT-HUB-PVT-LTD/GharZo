// import { createContext, useContext, useState } from "react";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });

//   const [role, setRole] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser).role : "Tenant";
//   });

//   const login = (userData) => {

//     // userData must include role
//     setUser(userData);
//     setRole(userData.role || "Tenant");
//     localStorage.setItem("user", JSON.stringify(userData));
//   };

//   const completeSignup = (signupData) => {
//     const updatedUser = {
//       ...user,
//       ...signupData,
//       isRegistered: true,
//     };
//     setUser(updatedUser);
//     localStorage.setItem("user", JSON.stringify(updatedUser));
//   };

//   const logout = () => {
//     setUser(null);
//     setRole("Tenant");
//     localStorage.removeItem("user");
//   };

//   const switchRole = (newRole) => {
//     setRole(newRole);
//     if (user) {
//       const updatedUser = { ...user, role: newRole };
//       setUser(updatedUser);
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         role,
//         login,
//         logout,
//         switchRole,
//         completeSignup,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }




 











import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // user: undefined (loading) | null (not authenticated) | object (authenticated)
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check for token in localStorage or sessionStorage
        const token = localStorage.getItem('token') || 
                     localStorage.getItem('usertoken') || 
                     sessionStorage.getItem('token');
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Verify token with API
        const response = await fetch('https://api.gharzoreality.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user) {
            setUser(data.data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch fresh user data from API
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('usertoken') || 
                   sessionStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const response = await fetch('https://api.gharzoreality.com/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          return data.data.user;
        }
      }
      
      setUser(null);
      return null;
    } catch (err) {
      console.error('Fetch user error:', err);
      setError(err.message);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Local login (for forms that don't use API)
  const login = (userData, userRole) => {
    const userData_with_role = { ...userData, role: userRole };
    setUser(userData_with_role);
    localStorage.setItem("user", JSON.stringify(userData_with_role));
    localStorage.setItem("role", userRole);
  };

  // Logout
  const logout = () => {
    setUser(null);
    setLoading(false);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("usertoken");
    localStorage.removeItem("token");
  };

  const switchRole = (newRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("role", newRole);
    }
  };

  const updateUser = (updatedFields) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const isTenant = () => {
    return user?.role === "tenant" || user?.role === "Tenant";
  };

  const isLandlord = () => {
    return user?.role === "landlord" || user?.role === "Landlord";
  };

  const isSubOwner = () => {
    return user?.role === "sub_owner" || user?.role === "subOwner";
  };

  const isWorker = () => {
    return user?.role === "worker" || user?.role === "Worker" || user?.role === "dr_worker";
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        error,
        fetchUser,
        login, 
        logout, 
        switchRole, 
        updateUser, 
        isTenant,
        isLandlord,
        isSubOwner,
        isWorker
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}