import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ← CRITICAL! Sends cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (for logging, adding tokens, etc.)
api.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for error handling)
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized (redirect to login)
    if (error.response?.status === 401) {
      // We'll handle this with TanStack Query later
      console.log('Unauthorized - token expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

export default api;