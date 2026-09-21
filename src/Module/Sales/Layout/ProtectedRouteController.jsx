import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const ProtectedRouteController = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while session/cookie check is in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-400 text-xs font-medium tracking-wide">
          Verifying session, please wait...
        </p>
      </div>
    );
  }

  // If user is logged in, render child routes (Layout and pages)
  // Otherwise redirect to the login page with current location saved
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/sales/login" state={{ from: location }} replace />
  );
};

export default ProtectedRouteController;
