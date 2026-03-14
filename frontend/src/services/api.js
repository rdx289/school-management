// src/services/api.js
// Centralized Axios instance with JWT interceptors

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally (token expired → redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Dashboard ─────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// ── Students ──────────────────────────────────────────
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/students/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/students/${id}`),
};

// ── Teachers ──────────────────────────────────────────
export const teachersAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/teachers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/teachers/${id}`),
};

// ── Classes ───────────────────────────────────────────
export const classesAPI = {
  getAll: () => api.get('/classes'),
  create: (data) => api.post('/classes', data),
  delete: (id) => api.delete(`/classes/${id}`),
  getSubjects: () => api.get('/classes/subjects'),
};

// ── Attendance ────────────────────────────────────────
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  getSummary: (params) => api.get('/attendance/summary', { params }),
};

// ── Fees ──────────────────────────────────────────────
export const feesAPI = {
  getAll: (params) => api.get('/fees', { params }),
  collect: (data) => api.post('/fees', data),
  getStats: () => api.get('/fees/stats'),
};

// ── Exams ─────────────────────────────────────────────
export const examsAPI = {
  getAll: (params) => api.get('/exams', { params }),
  create: (data) => api.post('/exams', data),
  getResults: (params) => api.get('/exams/results', { params }),
  enterResult: (data) => api.post('/exams/results', data),
};

// ── Notices ───────────────────────────────────────────
export const noticesAPI = {
  getAll: (params) => api.get('/notices', { params }),
  create: (data) => api.post('/notices', data),
  delete: (id) => api.delete(`/notices/${id}`),
};

export default api;
