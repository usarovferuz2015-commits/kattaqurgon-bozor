// ============================================
// API Routes - Cart
// ============================================
import { Router, Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { userService } from '../services/user.service';

const router = Router();

// GET /api/cart/:telegramId
router.get('/', async (req: Request, res: Response) => {
  try {
    const telegramId = req.user?.telegramId;
    if (!telegramId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const user = await userService.getByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const cart = await cartService.getOrCreateCart(user.id, telegramId);
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cart/:telegramId/add
router.post('/add', async (req: Request, res: Response) => {
  try {
    const telegramId = req.user?.telegramId;
    const { product_id, quantity, variant_id } = req.body;

    if (!telegramId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const user = await userService.getByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const cart = await cartService.addItem(user.id, telegramId, product_id, quantity, variant_id);
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cart/:telegramId/item/:itemId
router.delete('/item/:itemId', async (req: Request, res: Response) => {
  try {
    const telegramId = req.user?.telegramId;
    if (!telegramId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const user = await userService.getByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const cart = await cartService.removeItem(user.id, String((req.params as any).itemId));
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cart/:telegramId/item/:itemId
router.put('/item/:itemId', async (req: Request, res: Response) => {
  try {
    const telegramId = req.user?.telegramId;
    const { quantity } = req.body;

    if (!telegramId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const user = await userService.getByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const cart = await cartService.updateItemQuantity(user.id, String((req.params as any).itemId), quantity);
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cart/:telegramId/clear
router.delete('/clear', async (req: Request, res: Response) => {
  try {
    const telegramId = req.user?.telegramId;
    if (!telegramId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const user = await userService.getByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const cart = await cartService.clearCart(user.id);
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
