// ============================================
// API Routes - Sellers
// ============================================
import { Router, Request, Response } from 'express';
import { sellerService } from '../services/seller.service';
import { productService } from '../services/product.service';
import { userService } from '../services/user.service';

const router = Router();

// POST /api/sellers/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { telegram_id, ...sellerData } = req.body;
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

    const products = await productService.getBySeller(seller.id);
    res.json({ success: true, data: { ...seller, products: products.data } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/sellers/:telegramId
router.put('/:telegramId', async (req: Request, res: Response) => {
  try {
    const telegramId = parseInt(String((req.params as any).telegramId));
    const seller = await sellerService.update(telegramId, req.body);
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

export default router;
