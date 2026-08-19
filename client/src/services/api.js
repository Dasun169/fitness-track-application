import axios from 'axios';

// Get API base URL and normalize /api suffix
let rawBaseURL = import.meta.env.VITE_API_URL || '/api';

if (rawBaseURL !== '/api' && !rawBaseURL.endsWith('/api')) {
  rawBaseURL = rawBaseURL.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: rawBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_tracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Format error response messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('gym_tracker_token');
        localStorage.removeItem('gym_tracker_user');
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
