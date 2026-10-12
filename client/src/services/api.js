import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log('API Request:', config.method, config.url);
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateMe: (userData) => api.put('/auth/me', userData),
  fcmToken: (token) => api.post('/auth/fcm-token', { fcmToken: token }),
};

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  getBySlug: (slug) => api.get(`/projects/${slug}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  getDashboard: () => api.get('/projects/dashboard'),
  getStats: (id) => api.get(`/projects/${id}/stats`),
};

export const milestoneAPI = {
  getAll: (projectIdOrSlug) => api.get(`/milestones?projectId=${projectIdOrSlug}`),
  getById: (id) => api.get(`/milestones/${id}`),
  create: (milestoneData) => api.post('/milestones', milestoneData),
  update: (id, milestoneData) => api.put(`/milestones/${id}`, milestoneData),
  submit: (id) => api.post(`/milestones/${id}/submit`),
  approve: (id) => api.post(`/milestones/${id}/approve`),
  delete: (id) => api.delete(`/milestones/${id}`),
};

export const taskAPI = {
  getAll: (projectIdOrSlug, params) => api.get(`/tasks?projectId=${projectIdOrSlug}`, { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  complete: (id) => api.put(`/tasks/${id}/complete`),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const materialAPI = {
  getAll: (projectIdOrSlug, params) => api.get(`/materials?projectId=${projectIdOrSlug}`, { params }),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  getCategories: () => api.get('/materials/categories'),
};

export const laborAPI = {
  getAll: (projectIdOrSlug, params) => api.get(`/labor?projectId=${projectIdOrSlug}`, { params }),
  create: (data) => api.post('/labor', data),
  update: (id, data) => api.put(`/labor/${id}`, data),
  delete: (id) => api.delete(`/labor/${id}`),
};

export const reportAPI = {
  getAll: (projectIdOrSlug, params) => api.get(`/reports?projectId=${projectIdOrSlug}`, { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const photoAPI = {
  getAll: (projectIdOrSlug, params) => api.get(`/photos?projectId=${projectIdOrSlug}`, { params }),
  upload: (formData) => api.post('/photos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/photos/${id}`),
};

export const budgetAPI = {
  getByProject: (projectIdOrSlug) => api.get(`/budget/project/${projectIdOrSlug}`),
  create: (data) => api.post('/budget', data),
};

export const approvalAPI = {
  getPending: () => api.get('/approvals/pending'),
  approve: (data) => api.post('/approvals/approve', data),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const weatherAPI = {
  getByCoords: (lat, lng) => api.get(`/weather?lat=${lat}&lng=${lng}`),
};

export default api;
