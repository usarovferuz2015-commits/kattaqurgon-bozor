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
    const token = useAppStore.getState().token;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, token ? `Token: ${token.substring(0, 15)}...` : 'NO TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Xatolik yuz berdi';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
