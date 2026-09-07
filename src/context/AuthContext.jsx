import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUserApi, logoutApi } from "../Module/Sales/services/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derived role properties in memory (0 API calls once set)
  const role = user?.role || "";
  const isWorker = role === "Worker";
  const isObserver = role === "Observer";

  // Fetch current user on mount / page refresh via cookies
  useEffect(() => {
    let isMounted = true;
    const fetchUserFromCookie = async () => {
      try {
        const res = await getCurrentUserApi();
        if (isMounted && res && res.success && res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.warn("Cookie session check failed:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserFromCookie();

    return () => {
      isMounted = false;
    };
  }, []);

  // State lifting function
  const setAuthUser = (userData) => {
    setUser(userData);
  };

  // Login handler
  const login = (userData) => {
    setUser(userData);
  };

  // Logout handler: calls backend logout to clear cookies & clears state
  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn("Backend logout error:", e);
    }
    setUser(null);
    localStorage.removeItem("dss_user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isWorker,
        isObserver,
        loading,
        setAuthUser,
        login,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
