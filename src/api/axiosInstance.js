import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Store injector — avoids circular dependency.
// store.js calls injectStore(store) after creating it.
let store;
export const injectStore = (_store) => {
  store = _store;
};

// Request Interceptor: attach JWT token from Redux state
axiosInstance.interceptors.request.use(
  (config) => {
    if (store) {
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 (auto-logout) and 500 (global error toast)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        if (store) {
          // Dynamically import to avoid circular dependency at module load time
          import('../features/auth/authSlice').then(({ logout }) => {
            store.dispatch(logout());
          });
        }
        window.location.href = '/login';
      } else if (error.response.status === 500) {
        toast.error('A server error occurred. Please try again later.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
