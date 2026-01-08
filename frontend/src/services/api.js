import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

