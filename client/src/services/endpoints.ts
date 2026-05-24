import api from './api';

export const productService = {
  getHomepage: async () => {
    const { data } = await api.get('/products/homepage');
    return data;
  },
  getBySlug: async (slug: string) => {
    const { data } = await api.get(`/products/${slug}`);
    return data;
  },
  search: async (query: string, page = 1) => {
    const { data } = await api.get('/products', { params: { search: query, page } });
    return data;
  },
  getByCategory: async (categoryId: string, page = 1) => {
    const { data } = await api.get('/products', { params: { category_id: categoryId, page } });
    return data;
  },
  create: async (productData: any) => {
    const { data } = await api.post('/products', productData);
    return data;
  },
  update: async (id: string, productData: any) => {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
  getSellerProducts: async (sellerId: string, page = 1) => {
    const { data } = await api.get(`/products/seller/${sellerId}`, { params: { page } });
    return data;
  },
};

export const categoryService = {
  getAll: async () => {
    const { data } = await api.get('/categories');
    return data;
  },
  getFlat: async () => {
    const { data } = await api.get('/categories/flat');
    return data;
  },
  getBySlug: async (slug: string) => {
    const { data } = await api.get(`/categories/${slug}`);
    return data;
  },
  getFeatured: async () => {
    const { data } = await api.get('/categories/featured');
    return data;
  },
  create: async (categoryData: any) => {
    const { data } = await api.post('/categories', categoryData);
    return data;
  },
  update: async (id: string, categoryData: any) => {
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};

export const authService = {
  init: async (telegramId: number, userData?: any) => {
    const { data } = await api.post('/auth/init', { telegram_id: telegramId, ...userData });
    return data;
  },
  getUser: async (telegramId: number) => {
    const { data } = await api.get(`/users/${telegramId}`);
    return data;
  },
  updateUser: async (telegramId: number, userData: any) => {
    const { data } = await api.put(`/users/${telegramId}`, userData);
    return data;
  },
};

export const cartService = {
  get: async (telegramId: number) => {
    const { data } = await api.get(`/cart/${telegramId}`);
    return data;
  },
  add: async (telegramId: number, productId: string, quantity = 1) => {
    const { data } = await api.post(`/cart/${telegramId}/add`, { product_id: productId, quantity });
    return data;
  },
  remove: async (telegramId: number, itemId: string) => {
    const { data } = await api.delete(`/cart/${telegramId}/item/${itemId}`);
    return data;
  },
  updateQuantity: async (telegramId: number, itemId: string, quantity: number) => {
    const { data } = await api.put(`/cart/${telegramId}/item/${itemId}`, { quantity });
    return data;
  },
  clear: async (telegramId: number) => {
    const { data } = await api.delete(`/cart/${telegramId}/clear`);
    return data;
  },
};

export const sellerService = {
  register: async (telegramId: number, sellerData: any) => {
    const { data } = await api.post('/sellers/register', { telegram_id: telegramId, ...sellerData });
    return data;
  },
  get: async (identifier: string | number) => {
    const { data } = await api.get(`/sellers/${identifier}`);
    return data;
  },
  update: async (telegramId: number, sellerData: any) => {
    const { data } = await api.put(`/sellers/${telegramId}`, sellerData);
    return data;
  },
};

export const adminService = {
  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },
  getDailyStats: async (days = 30) => {
    const { data } = await api.get('/admin/stats/daily', { params: { days } });
    return data;
  },
  getUsers: async (page = 1) => {
    const { data } = await api.get('/admin/users', { params: { page } });
    return data;
  },
  getSellers: async () => {
    const { data } = await api.get('/admin/sellers');
    return data;
  },
  toggleSellerVerify: async (id: string) => {
    const { data } = await api.post(`/admin/sellers/${id}/verify`);
    return data;
  },
  toggleSellerActive: async (id: string) => {
    const { data } = await api.post(`/admin/sellers/${id}/toggle`);
    return data;
  },
  getBanners: async () => {
    const { data } = await api.get('/admin/banners');
    return data;
  },
  createBanner: async (bannerData: any) => {
    const { data } = await api.post('/admin/banners', bannerData);
    return data;
  },
  updateBanner: async (id: string, bannerData: any) => {
    const { data } = await api.put(`/admin/banners/${id}`, bannerData);
    return data;
  },
  deleteBanner: async (id: string) => {
    const { data } = await api.delete(`/admin/banners/${id}`);
    return data;
  },
  getAds: async () => {
    const { data } = await api.get('/admin/ads');
    return data;
  },
  createAd: async (adData: any) => {
    const { data } = await api.post('/admin/ads', adData);
    return data;
  },
  updateAd: async (id: string, adData: any) => {
    const { data } = await api.put(`/admin/ads/${id}`, adData);
    return data;
  },
  deleteAd: async (id: string) => {
    const { data } = await api.delete(`/admin/ads/${id}`);
    return data;
  },
};
