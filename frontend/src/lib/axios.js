import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Keep this since your backend uses cookies alongside tokens
});

// Request interceptor to add the token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-token");
      // Use window.location.href only as a fallback; rely on store navigation instead
      console.log("401 Unauthorized detected, clearing token");
      // Avoid immediate redirect here; let the store handle navigation
    }
    return Promise.reject(error);
  }
);