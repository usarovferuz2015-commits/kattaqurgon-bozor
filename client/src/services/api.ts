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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const tg = (window as any)?.Telegram?.WebApp;
        const initData = tg?.initData;
        if (initData) {
          const { authService } = await import('./endpoints');
          const res = await authService.init(initData);
          if (res.success && res.data?.token) {
            useAppStore.getState().setToken(res.data.token);
            error.config.headers.Authorization = `Bearer ${res.data.token}`;
            return api.request(error.config);
          }
        }
      } catch (e) {
        console.error('Re-auth failed:', e);
      }
    }
    const message = error.response?.data?.error || 'Xatolik yuz berdi';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
