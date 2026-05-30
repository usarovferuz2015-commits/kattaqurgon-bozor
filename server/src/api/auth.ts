// ============================================
// API Routes - Auth & Users
// ============================================
import { Router, Request, Response } from 'express';
import { userService } from '../services/user.service';
import { sellerService } from '../services/seller.service';
import { verifyTelegramInitData, generateToken } from '../utils/auth.utils';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthSchema } from '../utils/validation';

const router = Router();

// POST /api/auth/init - Initialize user session from WebApp
router.post('/init', validate(AuthSchema.init), async (req: Request, res: Response) => {
  try {
    const { initData } = req.body;
    console.log('initData received:', initData?.substring(0, 100));
    console.log('initData length:', initData?.length);

    if (!initData) {
      return res.status(400).json({ success: false, error: 'initData required' });
    }

    const verification = verifyTelegramInitData(initData);

    if (!verification.isValid || !verification.user) {
      return res.status(401).json({ success: false, error: 'Invalid Telegram authentication data' });
    }

    const { id: telegram_id, username, first_name, last_name, language_code } = verification.user;

    const user = await userService.findOrCreate(telegram_id, {
      username,
      first_name,
      last_name,
      language_code: language_code || 'uz',
    });

    const seller = await sellerService.getByTelegramId(telegram_id);

    const token = generateToken({
      id: user.id,
      telegramId: telegram_id,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
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

// POST /api/auth/init-by-id - Auth by telegramId (Desktop fallback)
router.post('/init-by-id', async (req: Request, res: Response) => {
  try {
    const { telegram_id } = req.body;
    if (!telegram_id) {
      return res.status(400).json({ success: false, error: 'telegram_id required' });
    }

    const user = await userService.findOrCreate(telegram_id, {});
    const seller = await sellerService.getByTelegramId(telegram_id);
    const token = generateToken({
      id: user.id,
      telegramId: telegram_id,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
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
router.get('/:telegramId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const targetTelegramId = parseInt(String((req.params as any).telegramId));
    const currentUserId = req.user?.telegramId;

    if (!currentUserId || (targetTelegramId !== currentUserId && req.user?.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only view your own profile' });
    }

    const user = await userService.getByTelegramId(targetTelegramId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:telegramId
router.put('/:telegramId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const targetTelegramId = parseInt(String((req.params as any).telegramId));
    const currentUserId = req.user?.telegramId;

    if (!currentUserId || (targetTelegramId !== currentUserId && req.user?.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only update your own profile' });
    }

    const user = await userService.update(targetTelegramId, req.body);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
