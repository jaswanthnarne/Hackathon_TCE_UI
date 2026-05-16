import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const teamToken = localStorage.getItem('teamToken');
  
  if (config.url?.startsWith('/admin') && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (config.url?.startsWith('/team') && teamToken) {
    config.headers.Authorization = `Bearer ${teamToken}`;
  } else if (adminToken && !teamToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (teamToken) {
    config.headers.Authorization = `Bearer ${teamToken}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdmin = error.config?.url?.startsWith('/admin');
      if (isAdmin) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (!window.location.pathname.includes('/admin/login')) window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('teamToken');
        localStorage.removeItem('teamUser');
        if (!window.location.pathname.includes('/team/login')) window.location.href = '/team/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
