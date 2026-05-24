import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const params = new URLSearchParams(window.location.search);
  const adminId = params.get('admin');
  if (adminId) {
    config.headers['X-Telegram-Id'] = adminId;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || 'Xatolik yuz berdi';
    console.error('API Error:', msg);
    return Promise.reject(err);
  }
);

export default api;
