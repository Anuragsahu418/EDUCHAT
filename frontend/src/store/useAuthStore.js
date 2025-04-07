import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  login: async (data, navigate) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data, { withCredentials: true });
      set({ authUser: res.data, isLoggingIn: false });
      localStorage.setItem("auth-token", res.data.token);
      toast.success("Login successful");
      get().connectSocket();
      navigate("/");
    } catch (error) {
      set({ isLoggingIn: false });
      const message = error.response?.data?.message || "Login failed";
      if (error.response?.status === 403) {
        toast.error("You are banned by ADMIN");
      } else if (error.response?.status === 401) {
        toast.error("Incorrect email or password");
      } else {
        toast.error(message);
      }
      throw error;
    }
  },

  signup: async (data, navigate) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data, { withCredentials: true });
      set({ authUser: res.data, isSigningUp: false });
      localStorage.setItem("auth-token", res.data.token);
      toast.success("Registration successful");
      get().connectSocket();
      navigate("/");
    } catch (error) {
      set({ isSigningUp: false });
      const message = error.response?.data?.message || "Signup failed";
      if (error.response?.status === 409) {
        toast.error("User already exists");
      } else {
        toast.error(message);
      }
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const token = localStorage.getItem("auth-token");
      if (!token) {
        set({ authUser: null, isCheckingAuth: false });
        return;
      }
      
      const res = await axiosInstance.get("/auth/check-auth");
      if (res.data) {
        set({ authUser: res.data, isCheckingAuth: false });
        get().connectSocket();
      }
    } catch (error) {
      set({ authUser: null, isCheckingAuth: false });
      localStorage.removeItem("auth-token");
      if (error.response?.status === 403) {
        toast.error("You are banned by ADMIN");
      } else if (error.response?.status === 401) {
        toast.error("Session expired, please log in again");
      }
    }
  },
  
  logout: async (navigate) => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, socket: null, onlineUsers: [], isCheckingAuth: false });
      localStorage.removeItem("auth-token");
      get().disconnectSocket();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  connectSocket: () => {
    try {
      const socket = io(BASE_URL, {
        auth: {
          token: localStorage.getItem("auth-token"),
        },
      });

      socket.on("connect", () => {
        console.log("Connected to socket server");
      });

      socket.on("onlineUsers", (users) => {
        set({ onlineUsers: users });
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      set({ socket });
    } catch (error) {
      console.error("Socket connection failed:", error);
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/users/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set({ authUser: res.data, isUpdatingProfile: false });
      toast.success("Profile updated successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      set({ isUpdatingProfile: false });
      throw error;
    }
  },
}));