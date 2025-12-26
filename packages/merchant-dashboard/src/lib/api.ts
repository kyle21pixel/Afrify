import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const storesApi = {
  getAll: () => api.get('/stores'),
  getOne: (id: string) => api.get(`/stores/${id}`),
  create: (data: any) => api.post('/stores', data),
  update: (id: string, data: any) => api.patch(`/stores/${id}`, data),
  delete: (id: string) => api.delete(`/stores/${id}`),
};

export const productsApi = {
  getAll: (storeId: string) => api.get(`/products?storeId=${storeId}`),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const ordersApi = {
  getAll: (storeId: string) => api.get(`/orders?storeId=${storeId}`),
  getOne: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.patch(`/orders/${id}`, data),
};

export const customersApi = {
  getAll: (storeId: string) => api.get(`/customers?storeId=${storeId}`),
  getOne: (id: string) => api.get(`/customers/${id}`),
};

export default api;
