// ============================================
// API Routes - Sellers
// ============================================
import { Router, Request, Response } from 'express';
import { sellerService } from '../services/seller.service';
import { productService } from '../services/product.service';
import { userService } from '../services/user.service';
import { validate } from '../middleware/validate';
import { SellerSchema } from '../utils/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/sellers/register
router.post('/register', authMiddleware, validate(SellerSchema.register), async (req: Request, res: Response) => {
  try {
    const telegram_id = (req as any).user?.telegramId;
    const { ...sellerData } = req.body;

    if (!telegram_id) {
      return res.status(401).json({ success: false, error: 'Auth required' });
    }

    const user = await userService.getByTelegramId(telegram_id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const existing = await sellerService.getByTelegramId(telegram_id);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Siz allaqachon sotuvchisiz' });
    }

    const seller = await sellerService.create(telegram_id, user.id, sellerData);
    res.status(201).json({ success: true, data: seller });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sellers/me - Get current authenticated seller's profile
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const telegramId = req.user?.telegramId;
    if (!telegramId) {
      return res.status(401).json({ success: false, error: 'Auth required' });
    }

    const seller = await sellerService.getByTelegramId(telegramId);
    if (!seller) {
      return res.status(403).json({ success: false, error: 'Siz sotuvchi emassiz' });
    }

    res.json({ success: true, data: seller });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sellers/:identifier
router.get('/:identifier', async (req: Request, res: Response) => {
  try {
    const identifier = String(req.params.identifier);
    const isNumeric = /^\d+$/.test(identifier);
 
    let seller;
    if (isNumeric) {
      seller = await sellerService.getByTelegramId(parseInt(identifier));
    } else {
      seller = await sellerService.getBySlug(identifier);
    }
 
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller not found' });
    }
 
    // Add total product count for the store header
    const productCount = await productService.getSellerProductCount(seller.id);
 
    res.json({ 
      success: true, 
      data: { 
        ...seller, 
        total_products: productCount 
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/sellers/:telegramId
router.put('/:telegramId', authMiddleware, validate(SellerSchema.update), async (req: Request, res: Response) => {
  try {
    const targetTelegramId = parseInt(String((req.params as any).telegramId));
    const currentUserId = (req as any).user?.telegramId;

    if (!currentUserId || (targetTelegramId !== currentUserId && (req as any).user?.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Forbidden: Faqat sotuvchi o\'z profilini tahrirlay oladi' });
    }

    const seller = await sellerService.update(targetTelegramId, req.body);
    res.json({ success: true, data: seller });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sellers/top/list
router.get('/top/list', async (_req: Request, res: Response) => {
  try {
    const sellers = await sellerService.getTopSellers();
    res.json({ success: true, data: sellers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/sellers/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sellerId = String((req.params as any).id);
    const seller = await sellerService.getById(sellerId);
    
    if (!seller) {
      return res.status(404).json({ success: false, error: 'Sotuvchi topilmadi' });
    }

    const currentUserId = (req as any).user?.telegramId;
    if (!currentUserId || (seller.telegram_id !== currentUserId && (req as any).user?.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Forbidden: Faqat admin yoki sotuvchining o\'zi o\'chira oladi' });
    }

    await sellerService.delete(sellerId);
    res.json({ success: true, message: 'Sotuvchi o\'chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
