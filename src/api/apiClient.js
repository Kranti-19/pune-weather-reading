import axios from "axios";

// Backend API URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Create Axios instance
const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle common API errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `API Error ${error.response.status}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error("API Error: No response from server.");
    } else {
      console.error("API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;