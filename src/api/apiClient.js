import axios from 'axios';

// Pull the production base URL from Vite environment variables with Render fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://pune-weather-reading.onrender.com';

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT auth token if available in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;