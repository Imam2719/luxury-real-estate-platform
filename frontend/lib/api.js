import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth/login';
          }
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/users/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Endpoints
export const propertyAPI = {
  getAll: (params) => api.get('/properties/', { params }),
  getBySlug: (slug) => api.get(`/properties/${slug}/`),
  getRecommendations: (slug) => api.get(`/properties/${slug}/recommendations/`),
};

export const categoryAPI = {
  getAll: () => api.get('/properties/categories/'),
  getBySlug: (slug) => api.get(`/properties/categories/${slug}/`),
};

export const authAPI = {
  register: (data) => api.post('/users/', data),
  login: (data) => api.post('/users/login/', data),
  getProfile: () => api.get('/users/me/'),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings/', data),
  getAll: () => api.get('/bookings/'),
  getById: (id) => api.get(`/bookings/${id}/`),
  cancel: (id) => api.post(`/bookings/${id}/cancel/`),
};

export const paymentAPI = {
  initiate: (data) => api.post('/payments/initiate/', data),
};

export default api;