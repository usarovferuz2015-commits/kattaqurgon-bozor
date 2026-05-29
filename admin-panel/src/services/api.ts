import axios from 'axios';
import qs from 'qs';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Auth token management for admin panel
let adminAuthToken: string | null = null;

async function initAdminAuth(adminId: number): Promise<string | null> {
  try {
    // Admin panel uses initData from Telegram WebApp or falls back
    const initData = (window as any)?.Telegram?.WebApp?.initData;
    
    if (initData) {
      const { data } = await api.post('/auth/init', { initData });
      if (data.success && data.data.token) {
        adminAuthToken = data.data.token;
        return data.data.token;
      }
    }
  } catch (err) {
    // Fallback: try direct admin endpoint
  }
  return null;
}

api.interceptors.request.use(async (config) => {
  // Try to get token
  if (!adminAuthToken) {
    const params = new URLSearchParams(window.location.search);
    const adminId = params.get('admin');
    
    if (adminId) {
      await initAdminAuth(parseInt(adminId));
    }
  }

  if (adminAuthToken) {
    config.headers['Authorization'] = `Bearer ${adminAuthToken}`;
  } else {
    // Legacy fallback (remove after migration)
    const params = new URLSearchParams(window.location.search);
    const adminId = params.get('admin');
    if (adminId) {
      config.headers['X-Telegram-Id'] = adminId;
    }
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
