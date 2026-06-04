// ============================================
// API Routes - Support Tickets
// ============================================
import { Router, Request, Response } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { supportService } from '../services/support.service';

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
      user_id: req.user?.id,
      subject,
      message,
      screenshot_url,
      page_url,
      device_info,
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
