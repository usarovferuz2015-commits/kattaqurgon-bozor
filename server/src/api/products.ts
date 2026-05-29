// ============================================
// API Routes - Products
// ============================================
import { Router, Request, Response } from 'express';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { sellerService } from '../services/seller.service';
import { analyticsService } from '../services/analytics.service';
import { userService } from '../services/user.service';
import { adminService } from '../services/admin.service';
import { notifyContactSeller } from '../bot';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { ProductSchema } from '../utils/validation';

const router = Router();

const router = Router();

// GET /api/products - Get all products (paginated)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = (req.query.sort_by as string) || 'created_at';
    const sortOrder = (req.query.sort_order as string) || 'desc';
    const categoryId = req.query.category_id as string;
    const search = req.query.search as string;

    let result;
    if (search) {
      result = await productService.search(search, page, limit);
    } else if (categoryId) {
      result = await productService.getByCategory(categoryId, page, limit, sortBy, sortOrder as any);
    } else {
      const allProducts = await productService.getHomepageProducts();
      result = {
        data: allProducts.recommended,
        total: allProducts.recommended.length,
        page: 1,
        limit: 20,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      };
    }

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/homepage - Homepage data
router.get('/homepage', async (_req: Request, res: Response) => {
  try {
    const [products, categories, banners] = await Promise.all([
      productService.getHomepageProducts(),
      categoryService.getFeatured(),
      adminService.getAllBanners(),
    ]);

    res.json({
      success: true,
      data: {
        ...products,
        categories,
        categoryTree: categories,
        banners: banners.filter((b: any) => b.is_active !== false),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:slug - Single product
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await productService.getBySlug(String((req.params as any).slug));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await productService.incrementViews(product.id);

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products - Create product (seller)
router.post('/', authMiddleware, validate(ProductSchema.create), async (req: Request, res: Response) => {
  try {
    const { ...productData } = req.body;
    const telegram_id = req.user?.telegramId;

    if (!telegram_id) {
      return res.status(401).json({ success: false, error: 'Auth required' });
    }

    const seller = await sellerService.getByTelegramId(telegram_id);
    if (!seller) {
      return res.status(403).json({ success: false, error: 'Sotuvchi topilmadi' });
    }

    const product = await productService.create(seller.id, productData);
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', authMiddleware, validate(ProductSchema.update), async (req: Request, res: Response) => {
  try {
    const productId = String((req.params as any).id);
    const product = await productService.getById(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
    }

    const seller = await sellerService.getByTelegramId(req.user?.telegramId || 0);
    if (!seller || seller.id !== product.seller_id) {
       if (req.user?.role !== 'admin') {
         return res.status(403).json({ success: false, error: 'Forbidden: Faqat mahsulot egasi tahrirlay oladi' });
       }
    }

    const updatedProduct = await productService.update(productId, req.body);
    res.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const productId = String((req.params as any).id);
    const product = await productService.getById(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
    }

    const seller = await sellerService.getByTelegramId(req.user?.telegramId || 0);
    if (!seller || seller.id !== product.seller_id) {
       if (req.user?.role !== 'admin') {
         return res.status(403).json({ success: false, error: 'Forbidden: Faqat mahsulot egasi o\'chira oladi' });
       }
    }

    await productService.delete(productId);
    res.json({ success: true, message: 'Mahsulot o\'chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/seller/:sellerId - Seller's products
router.get('/seller/:sellerId', async (req: Request, res: Response) => {
  try {
    const sellerId = String((req.params as any).sellerId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const categoryId = req.query.category_id as string;

    const result = await productService.getBySeller(sellerId, page, limit, search, categoryId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products/:slug/contact - Contact seller via bot
router.post('/:slug/contact', async (req: Request, res: Response) => {
  try {
    const { telegram_id } = req.body;
    if (!telegram_id) {
      return res.status(400).json({ success: false, error: 'telegram_id talab qilinadi' });
    }

    const product = await productService.getBySlug(String((req.params as any).slug));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
    }

    if (!product.seller || !product.seller.telegram_id) {
      return res.status(400).json({ success: false, error: 'Sotuvchi haqida ma\'lumot topilmadi' });
    }

    const buyer = await userService.getByTelegramId(telegram_id);
    const buyerName = buyer?.first_name || `Foydalanuvchi #${telegram_id}`;

    await notifyContactSeller(
      product.seller.telegram_id,
      telegram_id,
      buyerName,
      product.name_uz,
      product.slug
    );

    res.json({
      success: true,
      message: 'Xabar sotuvchiga yuborildi',
      has_username: !!(product.seller as any)?.user?.username,
      username: (product.seller as any)?.user?.username || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
