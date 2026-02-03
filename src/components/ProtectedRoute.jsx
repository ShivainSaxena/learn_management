// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check session expiry periodically
    const checkAuth = () => {
      const authExpiry = localStorage.getItem("auth_expiry");
      if (authExpiry) {
        const expiryTime = parseInt(authExpiry, 10);
        if (Date.now() > expiryTime) {
          logout();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [logout]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
};

export default ProtectedRoute;
