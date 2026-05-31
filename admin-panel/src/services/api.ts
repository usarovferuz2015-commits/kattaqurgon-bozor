import axios from 'axios';
import qs from 'qs';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Auth token management for admin panel
let adminAuthToken: string | null = null;
let isAuthing = false;

async function initAdminAuth(adminId: number): Promise<string | null> {
  if (isAuthing) return adminAuthToken;
  isAuthing = true;
  try {
    // Direct axios call (bypass interceptor to avoid recursion)
    const initData = (window as any)?.Telegram?.WebApp?.initData;
    
    if (initData) {
      const { data } = await axios.post(`${API_BASE}/auth/init`, { initData });
      if (data.success && data.data.token) {
        adminAuthToken = data.data.token;
        return data.data.token;
      }
    }
    
    // Desktop fallback: init-by-id
    const { data } = await axios.post(`${API_BASE}/auth/init-by-id`, { telegram_id: adminId });
    if (data.success && data.data.token) {
      adminAuthToken = data.data.token;
      return data.data.token;
    }
  } catch (err) {
    console.error('Admin auth failed:', err);
  } finally {
    isAuthing = false;
  }
  return null;
}

api.interceptors.request.use(async (config) => {
  if (!adminAuthToken) {
    const params = new URLSearchParams(window.location.search);
    const adminId = params.get('admin');
    if (adminId) {
      await initAdminAuth(parseInt(adminId));
    }
  }

  if (adminAuthToken) {
    config.headers['Authorization'] = `Bearer ${adminAuthToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      // Token expired, clear and retry
      adminAuthToken = null;
      const params = new URLSearchParams(window.location.search);
      const adminId = params.get('admin');
      if (adminId) {
        await initAdminAuth(parseInt(adminId));
      }
    }
    const msg = err.response?.data?.error || 'Xatolik yuz berdi';
    console.error('API Error:', msg);
    return Promise.reject(err);
  }
);

export default api;
