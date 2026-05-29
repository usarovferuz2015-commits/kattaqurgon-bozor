// ============================================
// API Routes - Admin
// ============================================
import { Router, Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { analyticsService } from '../services/analytics.service';
import { userService } from '../services/user.service';
import { sellerService } from '../services/seller.service';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/stats/daily
router.get('/stats/daily', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await analyticsService.getDailyStats(days);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await userService.getAll(page);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/users/count
router.get('/users/count', async (_req: Request, res: Response) => {
  try {
    const count = await userService.getCount();
    res.json({ success: true, data: { total: count } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/users/:telegramId/block
router.post('/users/:telegramId/block', async (req: Request, res: Response) => {
  try {
    await userService.blockUser(parseInt(String((req.params as any).telegramId)));
    res.json({ success: true, message: 'Foydalanuvchi bloklandi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/users/:telegramId/unblock
router.post('/users/:telegramId/unblock', async (req: Request, res: Response) => {
  try {
    await userService.unblockUser(parseInt(String((req.params as any).telegramId)));
    res.json({ success: true, message: 'Foydalanuvchi blokdan chiqarildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/sellers
router.get('/sellers', async (_req: Request, res: Response) => {
  try {
    const result = await sellerService.getAll();
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/sellers/:id/verify
router.post('/sellers/:id/verify', async (req: Request, res: Response) => {
  try {
    await adminService.toggleSellerVerified(String((req.params as any).id));
    res.json({ success: true, message: 'Sotuvchi statusi o\'zgartirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/sellers/:id/toggle
router.post('/sellers/:id/toggle', async (req: Request, res: Response) => {
  try {
    await adminService.toggleSellerActive(String((req.params as any).id));
    res.json({ success: true, message: 'Sotuvchi holati o\'zgartirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/sellers/:id - Update seller fields (e.g. store_slug)
router.put('/sellers/:id', async (req: Request, res: Response) => {
  try {
    const seller = await sellerService.updateById(String((req.params as any).id), req.body);
    res.json({ success: true, data: seller });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Banners ===
router.get('/banners', async (_req: Request, res: Response) => {
  try {
    const banners = await adminService.getAllBanners();
    res.json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/banners', async (req: Request, res: Response) => {
  try {
    const banner = await adminService.createBanner(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/banners/:id', async (req: Request, res: Response) => {
  try {
    const banner = await adminService.updateBanner(String((req.params as any).id), req.body);
    res.json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/banners/:id', async (req: Request, res: Response) => {
  try {
    await adminService.deleteBanner(String((req.params as any).id));
    res.json({ success: true, message: 'Banner o\'chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Premium Ads ===
router.get('/ads', async (_req: Request, res: Response) => {
  try {
    const ads = await adminService.getAllPremiumAds();
    res.json({ success: true, data: ads });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/ads', async (req: Request, res: Response) => {
  try {
    // Remove seller_id if empty (allows null)
    const data = { ...req.body };
    if (!data.seller_id) delete data.seller_id;
    const ad = await adminService.createPremiumAd(data);
    res.status(201).json({ success: true, data: ad });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/ads/:id', async (req: Request, res: Response) => {
  try {
    const ad = await adminService.updatePremiumAd(String((req.params as any).id), req.body);
    res.json({ success: true, data: ad });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/ads/:id', async (req: Request, res: Response) => {
  try {
    await adminService.deletePremiumAd(String((req.params as any).id));
    res.json({ success: true, message: 'Reklama o\'chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Featured Products ===
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const featured = await adminService.getAllFeaturedProducts();
    res.json({ success: true, data: featured });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/featured', async (req: Request, res: Response) => {
  try {
    const { product_id, section, sort_order } = req.body;
    const featured = await adminService.addFeaturedProduct(product_id, section, sort_order);
    res.status(201).json({ success: true, data: featured });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/featured/:id', async (req: Request, res: Response) => {
  try {
    await adminService.removeFeaturedProduct(String((req.params as any).id));
    res.json({ success: true, message: 'Featured product o\'chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === Admin Management ===
router.get('/admins', async (_req: Request, res: Response) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.json({ success: true, data: admins });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
