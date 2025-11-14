import React, { useState, useEffect } from "react";
import { AppContent } from "./AppContext";
import axios from "axios";

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Configure axios to always send cookies
  axios.defaults.withCredentials = true;

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // optional: handle loading state

  // ✅ Fetch user data from backend
  const getUserData = async () => {
    try {
      // Ensure axios is configured to send cookies
      axios.defaults.withCredentials = true;
      //get because it will return promise which is async
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });

      if (data.success && data.userData) {
        setUserData(data.userData);
        setIsLoggedin(true);
        return data.userData; // Return user data for redirection logic
      } else {
        setUserData(null);
        setIsLoggedin(false);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
      setIsLoggedin(false);
      return null;
    } finally {
      setLoadingUser(false);
    }
  };

  // ✅ Check authentication state on startup
  const getAuthState = async () => {
    try {
      // Ensure axios is configured to send cookies
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });

      if (data.success && data.userData) {
        setIsLoggedin(true);
        setUserData(data.userData);
        console.log("✅ User authenticated on startup:", data.userData);
        console.log("✅ User role:", data.userData.role);
      } else {
        setIsLoggedin(false);
        setUserData(null);
        console.log("❌ No authenticated user on startup");
      }
    } catch (error) {
      console.warn("Auth check failed:", error.response?.data?.message || error.message);
      setIsLoggedin(false);
      setUserData(null);
    } finally {
      setLoadingUser(false); // Always set loading to false
    }
  };

  // ✅ Run once on mount to load user state
  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    getAuthState,
    loadingUser,
  };

  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
};