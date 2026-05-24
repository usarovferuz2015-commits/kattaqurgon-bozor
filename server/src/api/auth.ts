// ============================================
// API Routes - Auth & Users
// ============================================
import { Router, Request, Response } from 'express';
import { userService } from '../services/user.service';
import { sellerService } from '../services/seller.service';

const router = Router();

// POST /api/auth/init - Initialize user session from WebApp
router.post('/init', async (req: Request, res: Response) => {
  try {
    const { telegram_id, username, first_name, last_name, language_code } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ success: false, error: 'telegram_id required' });
    }

    const user = await userService.findOrCreate(telegram_id, {
      username,
      first_name,
      last_name,
      language_code: language_code || 'uz',
    });

    const seller = await sellerService.getByTelegramId(telegram_id);

    res.json({
      success: true,
      data: {
        user,
        seller,
        is_seller: !!seller,
        is_admin: user.role === 'admin',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:telegramId
router.get('/:telegramId', async (req: Request, res: Response) => {
  try {
    const telegramId = parseInt(String((req.params as any).telegramId));
    const user = await userService.getByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:telegramId
router.put('/:telegramId', async (req: Request, res: Response) => {
  try {
    const telegramId = parseInt(String((req.params as any).telegramId));
    const user = await userService.update(telegramId, req.body);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
