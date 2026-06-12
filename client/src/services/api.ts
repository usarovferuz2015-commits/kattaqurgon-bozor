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

let isRefreshing = false;

api.interceptors.request.use(
  (config) => {
    const state = useAppStore.getState();
    const token = state.token;
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
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tg = (window as any)?.Telegram?.WebApp;

        // Try initData auth first
        if (tg?.initData) {
          const { authService } = await import('./endpoints');
          const res = await authService.init(tg.initData);
          if (res.success && res.data?.token) {
            useAppStore.getState().setToken(res.data.token);
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            isRefreshing = false;
            return api(originalRequest);
          }
        }

        // Fallback: try initById  
        const storeState = useAppStore.getState();
        const id = storeState.telegramId 
          || storeState.user?.telegram_id 
          || tg?.initDataUnsafe?.user?.id 
          || new URLSearchParams(window.location.search).get('user');

        if (id) {
          const { authService } = await import('./endpoints');
          const res = await authService.initById(Number(id));
          if (res.success && res.data?.token) {
            useAppStore.getState().setToken(res.data.token);
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            isRefreshing = false;
            return api(originalRequest);
          }
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.error || 'Xatolik yuz berdi';
    console.error('API Error:', error.response?.status, message);
    return Promise.reject(error);
  }
);

export default api;
