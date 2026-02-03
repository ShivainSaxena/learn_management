// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext({
  isAuthenticated: false,
  login: (password) => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user was previously authenticated
    const authExpiry = localStorage.getItem("auth_expiry");
    const isAuth = localStorage.getItem("isAuthenticated");

    if (isAuth === "true" && authExpiry) {
      const expiryTime = parseInt(authExpiry, 10);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("auth_expiry");
      }
    }
  }, []);

  const login = (password) => {
    // For simplicity, using a hardcoded password
    // In production, you'd want to validate against a server
    const correctPassword = process.env.VITE_APP_PASSWORD;

    if (password === correctPassword) {
      const expiryTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("auth_expiry", expiryTime.toString());
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("auth_expiry");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
