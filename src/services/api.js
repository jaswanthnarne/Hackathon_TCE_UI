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
  const volunteerToken = localStorage.getItem('volunteerToken');
  const judgeToken = localStorage.getItem('judgeToken');
  
  if (config.url?.startsWith('/console/admin') && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (config.url?.startsWith('/team') && teamToken) {
    config.headers.Authorization = `Bearer ${teamToken}`;
  } else if (config.url?.startsWith('/volunteer') && volunteerToken) {
    config.headers.Authorization = `Bearer ${volunteerToken}`;
  } else if (config.url?.startsWith('/judge') && judgeToken) {
    config.headers.Authorization = `Bearer ${judgeToken}`;
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
      if (error.config?.url?.startsWith('/console/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (!window.location.pathname.includes('/console/admin/login')) window.location.href = '/console/admin/login';
      } else if (error.config?.url?.startsWith('/volunteer')) {
        localStorage.removeItem('volunteerToken');
        localStorage.removeItem('volunteerUser');
        if (!window.location.pathname.includes('/volunteer/login')) window.location.href = '/volunteer/login';
      } else if (error.config?.url?.startsWith('/judge')) {
        localStorage.removeItem('judgeToken');
        localStorage.removeItem('judgeUser');
        if (!window.location.pathname.includes('/judge/login')) window.location.href = '/judge/login';
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
