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
  console.log('[AdminAuth] Starting auth for', adminId);
  try {
    const initData = (window as any)?.Telegram?.WebApp?.initData;
    console.log('[AdminAuth] initData available:', !!initData);
    
    if (initData) {
      const { data } = await axios.post(`${API_BASE}/auth/init`, { initData });
      console.log('[AdminAuth] /auth/init response:', data.success, !!data.data?.token);
      if (data.success && data.data.token) {
        adminAuthToken = data.data.token;
        console.log('[AdminAuth] Token set via /auth/init');
        return data.data.token;
      }
    }
    
    console.log('[AdminAuth] Trying /auth/init-by-id');
    const { data } = await axios.post(`${API_BASE}/auth/init-by-id`, { telegram_id: adminId });
    console.log('[AdminAuth] /auth/init-by-id response:', data.success, !!data.data?.token);
    if (data.success && data.data.token) {
      adminAuthToken = data.data.token;
      console.log('[AdminAuth] Token set via /auth/init-by-id');
      return data.data.token;
    }
    console.log('[AdminAuth] No token in response');
  } catch (err) {
    console.error('[AdminAuth] Error:', err);
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
