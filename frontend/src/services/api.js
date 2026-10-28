import axios from 'axios';

// Centralized API base URL configuration
// In production: uses VITE_API_BASE_URL or falls back to deployed Render backend
// In local development: uses VITE_API_BASE_URL or falls back to http://localhost:5000
const PRODUCTION_API_URL = 'https://dental-clinic-vb9y.onrender.com';
const DEVELOPMENT_API_URL = 'http://localhost:5000';

const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

// Get base URL from environment variable, if set
const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

// If in production mode, never allow localhost fallback
let resolvedBaseUrl;
if (isProduction) {
  // If an environment variable is provided and is NOT localhost, use it; otherwise use the deployed Render URL
  if (envBaseUrl && !envBaseUrl.includes('localhost') && !envBaseUrl.includes('127.0.0.1')) {
    resolvedBaseUrl = envBaseUrl;
  } else {
    resolvedBaseUrl = PRODUCTION_API_URL;
  }
} else {
  // In local development, use envBaseUrl if provided, else default to localhost:5000
  resolvedBaseUrl = envBaseUrl || DEVELOPMENT_API_URL;
}

const API_URL = resolvedBaseUrl.endsWith('/api') ? resolvedBaseUrl : `${resolvedBaseUrl}/api`;

export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL && !isProduction
  ? import.meta.env.VITE_UPLOADS_URL.trim().replace(/\/+$/, '')
  : (resolvedBaseUrl.endsWith('/api') ? resolvedBaseUrl.slice(0, -4) : resolvedBaseUrl);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request and safeguard against localhost calls on live websites
api.interceptors.request.use((config) => {
  // Runtime domain guard: If running in a browser on a live non-localhost domain,
  // enforce that requests never go to localhost
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (config.baseURL && (config.baseURL.includes('localhost') || config.baseURL.includes('127.0.0.1'))) {
      config.baseURL = `${PRODUCTION_API_URL}/api`;
    }
    if (config.url && (config.url.startsWith('http://localhost') || config.url.startsWith('http://127.0.0.1'))) {
      config.url = config.url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, PRODUCTION_API_URL);
    }
  }

  const token = localStorage.getItem('sc_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (expired/invalid token)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sc_admin_token');
      localStorage.removeItem('sc_admin_user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Public API helpers ─────────────────────────────────────────────────

export const publicApi = {
  getSettings: () => api.get('/settings'),
  getContent: (key) => api.get(`/content/${key}`),
  getAllContent: (section) => api.get('/content', { params: { section } }),
  getServices: () => api.get('/services'),
  getServiceBySlug: (slug) => api.get(`/services/${slug}`),
  getDoctors: () => api.get('/doctors'),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  getGallery: () => api.get('/gallery'),
  getTestimonials: () => api.get('/testimonials'),
  getSlots: (date, doctorId) => api.get('/appointments/slots', { params: { date, doctorId } }),
  bookAppointment: (data) => api.post('/appointments', data),
  submitContact: (data) => api.post('/contact', data),
};

// ─── Admin API helpers ───────────────────────────────────────────────────

export const adminApi = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),

  // Dashboard
  getStats: () => api.get('/admin/overview'),

  // Services
  getServices: (params) => api.get('/admin/services', { params }),
  getService: (id) => api.get(`/admin/services/${id}`),
  createService: (data) => api.post('/admin/services', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  uploadServiceImage: (id, formData) => api.post(`/admin/services/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Doctors
  getDoctors: (params) => api.get('/admin/doctors', { params }),
  getDoctor: (id) => api.get(`/admin/doctors/${id}`),
  createDoctor: (data) => api.post('/admin/doctors', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  uploadDoctorImage: (id, formData) => api.post(`/admin/doctors/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Appointments
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getAppointment: (id) => api.get(`/admin/appointments/${id}`),
  updateAppointmentStatus: (id, data) => api.put(`/admin/appointments/${id}/status`, data),

  // Gallery
  getGallery: (params) => api.get('/admin/gallery', { params }),
  uploadGallery: (formData) => api.post('/admin/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateGallery: (id, data) => api.put(`/admin/gallery/${id}`, data),
  deleteGallery: (id) => api.delete(`/admin/gallery/${id}`),

  // Testimonials
  getTestimonials: (params) => api.get('/admin/testimonials', { params }),
  createTestimonial: (data) => api.post('/admin/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`),

  // Inquiries
  getInquiries: (params) => api.get('/admin/inquiries', { params }),
  getInquiry: (id) => api.get(`/admin/inquiries/${id}`),
  updateInquiry: (id, data) => api.put(`/admin/inquiries/${id}`, data),
  deleteInquiry: (id) => api.delete(`/admin/inquiries/${id}`),

  // Settings & Content
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  uploadLogo: (formData) => api.post('/admin/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAllContent: (section) => api.get('/admin/content', { params: { section } }),
  upsertContent: (key, data) => api.put(`/admin/content/${key}`, data),
  deleteContent: (id) => api.delete(`/admin/content/${id}`),
};
