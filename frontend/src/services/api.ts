import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create base Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('protrack_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      localStorage.removeItem('protrack_token');
      localStorage.removeItem('protrack_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Type-safe helper with automatic backend attempt and graceful resilience fallback
export async function apiRequest<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await requestFn();
    return res.data;
  } catch (err: unknown) {
    const axiosError = err as AxiosError;
    // If backend server is not running or network connection failed, use fallback
    if (!axiosError.response || axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
      console.warn(`[ProTrack API] Backend unavailable at ${API_BASE_URL}. Using reactive client state store.`);
      return await fallbackFn();
    }
    // If it's a real HTTP error from backend (400, 403, 404, 500), throw it so UI handles validation
    throw err;
  }
}
