import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('No tienes permiso para acceder a este recurso');
    }
    return Promise.reject(error);
  }
);

export const vacanciesApi = {
  getAll: (filters = {}) =>
    api.get('/vacancies', { params: filters }).then((res) => res.data),
  create: (data) =>
    api.post('/vacancies', data).then((res) => res.data),
  getById: (id) =>
    api.get(`/vacancies/${id}`).then((res) => res.data),
  update: (id, data) =>
    api.put(`/vacancies/${id}`, data).then((res) => res.data),
};

export const profilesApi = {
  getAll: (filters = {}) =>
    api.get('/profiles', { params: filters }).then((res) => res.data),
  create: (data) =>
    api.post('/profiles', data).then((res) => res.data),
  generateWithAI: (data) =>
    api.post('/profiles/generate-ai', data).then((res) => res.data),
};

export const portalsApi = {
  getAll: (filters = {}) =>
    api.get('/portals', { params: filters }).then((res) => res.data),
  saveCredentials: (portalId, credentials) =>
    api.put(`/portals/${portalId}/credentials`, credentials).then((res) => res.data),
};

export const campaignsApi = {
  create: (data) =>
    api.post('/campaigns', data).then((res) => res.data),
  getById: (id) =>
    api.get(`/campaigns/${id}`).then((res) => res.data),
  publish: (id) =>
    api.post(`/campaigns/${id}/publish`).then((res) => res.data),
  cancel: (id) =>
    api.post(`/campaigns/${id}/cancel`).then((res) => res.data),
};

export const paymentsApi = {
  create: (data) =>
    api.post('/payments', data).then((res) => res.data),
  getById: (id) =>
    api.get(`/payments/${id}`).then((res) => res.data),
};

export const companiesApi = {
  getAll: () =>
    api.get('/companies').then((res) => res.data),
};

export const categoriesApi = {
  getAll: () =>
    api.get('/categories').then((res) => res.data),
};

export default api;
