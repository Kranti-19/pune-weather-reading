// src/api/apiClient.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Or her backend port (e.g., 5000 or 8000)
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