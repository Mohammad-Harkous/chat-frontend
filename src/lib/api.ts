import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ← CRITICAL! Sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('❌ API Error:', error.response?.status, error.config?.url);

    // If request is to /auth/refresh and it fails, logout immediately
    if (originalRequest.url === '/auth/refresh') {
      console.error('❌ Refresh token invalid, logging out...');
      isRefreshing = false;
      processQueue(error);
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If error is not 401 or request already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('🔄 Refreshing access token...');
      
      // Call refresh endpoint
      await api.post('/auth/refresh');
      
      console.log('✅ Token refreshed successfully');
      
      // Process all queued requests
      processQueue(null);
      
      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      console.error('❌ Token refresh failed');
      
      // Refresh failed, process queue with error
      processQueue(refreshError as Error);
      
      // Redirect to login (token refresh failed)
      window.location.href = '/login';
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;