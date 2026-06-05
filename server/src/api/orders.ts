// ============================================
// API Routes - Orders
// ============================================
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';
import { sellerService } from '../services/seller.service';
import { getBot } from '../bot';

const router = Router();

// POST /api/orders - Create order (buyer)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buyerTelegramId = req.user?.telegramId;
    if (!buyerTelegramId) return res.status(401).json({ success: false, error: 'Auth required' });

    const { phone, itemsBySeller } = req.body;
    if (!phone || !itemsBySeller?.length) {
      return res.status(400).json({ success: false, error: 'Telefon raqam va mahsulotlar majburiy' });
    }

    // Update user phone
    await userService.update(buyerTelegramId, { phone });

    const createdOrders = [];
    const bot = getBot();

    for (const group of itemsBySeller) {
      // sellerId is UUID, look up seller_telegram_id
      const seller = await sellerService.getById(group.sellerId);
      const sellerTelegramId = seller?.telegram_id || group.sellerTelegramId;
      
      const total = group.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
      const order = await orderService.create({
        buyer_telegram_id: buyerTelegramId,
        buyer_phone: phone,
        seller_telegram_id: sellerTelegramId,
        seller_id: group.sellerId,
        total_amount: total,
        items: group.items,
      });

      // Notify seller via Telegram
      try {
        const itemsList = group.items.map((i: any) => `• ${i.product_name} x${i.quantity}`).join('\n');
        await bot.api.sendMessage(
          sellerTelegramId,
          `🛒 <b>Yangi buyurtma</b>\n\n` +
          `🆔 Buyurtma №${order.id.slice(0, 8)}\n` +
          `📞 Telefon: ${phone}\n\n` +
          `📦 Mahsulotlar:\n${itemsList}\n\n` +
          `💰 Jami: ${total.toLocaleString()} so'm\n` +
          `📌 Status: Pending`,
          { parse_mode: 'HTML' }
        );
      } catch (e) {
        console.error('Failed to notify seller:', e);
      }

      createdOrders.push(order);
    }

    // Notify buyer via Telegram
    try {
      let buyerMsg = `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n`;
      for (const order of createdOrders) {
        const group = itemsBySeller.find((g: any) => g.sellerId === order.seller_id);
        const itemsList = group?.items?.map((i: any) => `• ${i.product_name} x${i.quantity}`).join('\n') || '';
        buyerMsg += `🆔 Buyurtma №${order.id.slice(0, 8)}\n`;
        buyerMsg += `📌 Status: Pending\n`;
        buyerMsg += itemsList ? `📦 Mahsulotlar:\n${itemsList}\n` : '';
        buyerMsg += `💰 Jami: ${Number(order.total_amount).toLocaleString()} so'm\n\n`;
      }
      buyerMsg += `📞 Telefon: ${phone}\n⏳ Sotuvchi tez orada bog'lanadi.`;
      await bot.api.sendMessage(buyerTelegramId, buyerMsg, { parse_mode: 'HTML' });
    } catch (e) {
      console.error('Failed to notify buyer:', e);
    }

    res.status(201).json({ success: true, data: createdOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/orders/seller - Seller's orders
router.get('/seller', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sellerTelegramId = req.user?.telegramId;
    if (!sellerTelegramId) return res.status(401).json({ success: false, error: 'Auth required' });

    const orders = await orderService.getBySeller(sellerTelegramId);
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/orders/:id - Update order status (seller)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sellerTelegramId = req.user?.telegramId;
    if (!sellerTelegramId) return res.status(401).json({ success: false, error: 'Auth required' });

    const { status } = req.body;
    const updated = await orderService.updateStatus(
      String((req.params as any).id),
      status,
      sellerTelegramId
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
