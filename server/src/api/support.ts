// ============================================
// API Routes - Support Tickets
// ============================================
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { supportService } from '../services/support.service';
import { config } from '../config';
import { getBot } from '../bot';

const router = Router();

// POST /api/support - Create ticket (authenticated users)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const telegram_id = req.user?.telegramId;
    if (!telegram_id) {
      return res.status(401).json({ success: false, error: 'Auth required' });
    }

    const { subject, message, screenshot_url, page_url, device_info } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'Mavzu va xabar majburiy' });
    }

    const ticket = await supportService.create({
      telegram_id,
      subject,
      message,
      screenshot_url,
      page_url,
      device_info,
    });

    // Notify all admins via Telegram
    try {
      const bot = getBot();
      for (const adminId of config.admin.telegramIds) {
        await bot.api.sendMessage(adminId,
          `🆘 <b>Yangi murojaat</b>\n\n` +
          `🆔 ID: #${ticket.id.slice(0, 8)}\n` +
          `👤 Foydalanuvchi: ${telegram_id}\n` +
          `📝 Mavzu: ${subject}\n` +
          `💬 Xabar: ${message}\n` +
          `🕐 Vaqt: ${new Date().toLocaleString('uz-UZ')}`,
          { parse_mode: 'HTML' }
        );
      }
    } catch (e) {
      console.error('Failed to notify admins:', e);
    }

    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/support/my - Get current user's tickets
router.get('/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const telegram_id = req.user?.telegramId;
    if (!telegram_id) return res.status(401).json({ success: false, error: 'Auth required' });

    const tickets = await supportService.getByTelegramId(telegram_id);
    res.json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
