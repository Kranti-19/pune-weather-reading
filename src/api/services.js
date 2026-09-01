// src/api/services.js
import API from './apiClient';

// 1. Station Services (Matches stationRoutes.js)
export const fetchAllStations = () => API.get('/stations');
export const fetchStationById = (id) => API.get(`/stations/${id}`);
export const fetchStationHistory = (id, range = '24h') => API.get(`/stations/${id}/history?range=${range}`);

// 2. Alert Services (Matches alertRoutes.js)
export const fetchAlerts = () => API.get('/alerts');
export const acknowledgeAlert = (alertId) => API.patch(`/alerts/${alertId}/acknowledge`);

// 3. Report Services (Matches reportRoutes.js)
export const generateReport = (stationId, date) => API.get(`/reports/${stationId}?date=${date}`);
export const exportReportCSV = (params) => API.get('/reports/export', { params, responseType: 'blob' });

// 4. Auth Services (Matches authRoutes.js)
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);