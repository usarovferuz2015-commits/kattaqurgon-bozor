import axios from 'axios';
import { useAppStore } from '../store/appStore';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const state = useAppStore.getState();
    const token = state.token;
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, token ? `TOKEN=${token.slice(0,12)}...` : 'NO TOKEN');
    console.log(`[API] Full headers:`, JSON.stringify(config.headers));
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[API] WARNING: No token for ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Xatolik yuz berdi';
    console.error('API Error:', error.response?.status, message);
    return Promise.reject(error);
  }
);

export default api;
