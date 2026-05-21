import axios from "axios";
import { API_BASE_URL } from "./config";

export const UNAUTHORIZED_EVENT_NAME = "app:unauthorized";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT_NAME));

      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";
      if (!isAuthPage) {
        window.location.replace("/login");
      }
    }

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
