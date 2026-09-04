import axios from "axios";

const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168."));

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocal
    ? "http://localhost:8000/api/v1"
    : "https://dss-infra-crm.onrender.com/api/v1");

/**
 * Returns dynamic authorization and content-type headers.
 */
export const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("accessToken");
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Centralized Axios instance with request and response interceptors.
 * Timeout is set to 90s to accommodate Render's free tier cold start (spindown).
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Attach bearer token & handle content headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API responses & graceful error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorResponse = error.response?.data || {
      success: false,
      message: error.message || "Network error. Please try again."
    };
    return Promise.resolve(errorResponse);
  }
);

export default apiClient;
