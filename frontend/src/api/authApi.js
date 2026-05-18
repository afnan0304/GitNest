import axios from 'axios';

/**
 * API base URL configuration
 * Uses VITE_API_URL env var, defaults to localhost for development
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Attach JWT token from auth store to every request
 */
authApi.interceptors.request.use(
  (config) => {
    try {
      const state = JSON.parse(localStorage.getItem('auth-storage'));
      const token = state?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silently ignore parsing errors - invalid storage state is handled by auth store
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle standardized error responses
 */
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Preserve axios error format for caller to handle
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 * @param {Object} userData - { username, email, password }
 * @returns {Object} API response with user data and token
 */
export const registerUser = async (userData) => {
  const response = await authApi.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 * @param {Object} userData - { email, password }
 * @returns {Object} API response with user data and token
 */
export const loginUser = async (userData) => {
  const response = await authApi.post('/auth/login', userData);
  return response.data;
};

/**
 * Get current authenticated user
 * @returns {Object} API response with user data
 */
export const getMe = async () => {
  const response = await authApi.get('/auth/me');
  return response.data;
};

/**
 * Update user profile
 * @param {Object} profileData - Profile fields to update
 * @returns {Object} API response with updated user data
 */
export const updateUserProfile = async (profileData) => {
  const response = await authApi.put('/users/profile', profileData);
  return response.data;
};

export default authApi;

