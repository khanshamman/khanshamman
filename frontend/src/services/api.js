import axios from 'axios';

// Use environment variable for API URL, fallback to /api for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Product API
export const productApi = {
  getAll: () => api.get('/products'),
  getActive: () => api.get('/products/active'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Order API
export const orderApi = {
  getAll: (params) => api.get('/orders', { params }),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
  getNotificationCount: () => api.get('/orders/admin/notifications/count'),
  getUnnotified: () => api.get('/orders/admin/notifications/unread'),
  markNotified: (id) => api.put(`/orders/admin/notifications/${id}/read`),
  markAllNotified: () => api.put('/orders/admin/notifications/read-all'),
  getSalesUsers: () => api.get('/orders/admin/sales-users')
};


// Upload API
export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  },
  deleteImage: (filename) => api.delete('/upload/image', { data: { filename } })
};


