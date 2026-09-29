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

  // Fetch current user on mount / page refresh via session
  useEffect(() => {
    let isMounted = true;
    const fetchUserFromSession = async () => {
      // If there is no session token in sessionStorage, do not auto-login
      const sessionToken = sessionStorage.getItem("accessToken");
      if (!sessionToken) {
        if (isMounted) {
          setUser(null);
          // Clean up any stale localStorage tokens from previous versions
          localStorage.removeItem("dss_user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await getCurrentUserApi();
        if (isMounted && res && res.success && res.data) {
          setUser(res.data);
        } else if (isMounted) {
          setUser(null);
          sessionStorage.removeItem("dss_user");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          localStorage.removeItem("dss_user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch (err) {
        console.warn("Session check failed:", err);
        if (isMounted) {
          setUser(null);
          sessionStorage.removeItem("dss_user");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          localStorage.removeItem("dss_user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserFromSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // State lifting function
  const setAuthUser = (userData) => {
    setUser(userData);
  };

  // Login handler: saves to sessionStorage so session ends when browser/tab closes
  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
    // Clear old localStorage if any
    localStorage.removeItem("dss_user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    if (userData) {
      sessionStorage.setItem("dss_user", JSON.stringify(userData));
    }
    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken);
    }
    if (refreshToken) {
      sessionStorage.setItem("refreshToken", refreshToken);
    }
  };

  // Logout handler: calls backend logout to clear cookies & clears session
  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.warn("Backend logout error:", e);
    } finally {
      setUser(null);
      localStorage.removeItem("dss_user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();
    }
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
