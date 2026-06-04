// ============================================
// API Routes - Product Reviews & Ratings
// ============================================
import { Router, Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { validate } from '../middleware/validate';
import { ReviewSchema } from '../utils/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/reviews/:productId - Get reviews for a product
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const productId = (req.params as any).productId;
    const reviews = await reviewService.getByProductId(productId);
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reviews - Create or update a review
router.post('/', validate(ReviewSchema.create), async (req: Request, res: Response) => {
  try {
    const { product_id, rating, comment, telegram_id } = req.body;

    if (!telegram_id || !product_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'product_id, telegram_id va rating majburiy',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Reyting 1 dan 5 gacha bo\'lishi kerak',
      });
    }

    const review = await reviewService.create({
      telegram_id,
      product_id,
      rating,
      comment,
    });

    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/reviews/:productId/my - Get current user's review
router.get('/:productId/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const productId = (req.params as any).productId;
    const telegramId = req.user?.telegramId;

    if (!telegramId) {
      return res.json({ success: true, data: null });
    }

    const review = await reviewService.getUserReview(productId, telegramId);
    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/reviews/:reviewId
router.delete('/:reviewId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const reviewId = (req.params as any).reviewId;
    const telegramId = req.user?.telegramId;

    if (!telegramId) {
      return res.status(400).json({ success: false, error: 'Auth required' });
    }

    const review = await reviewService.getById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Izoh topilmadi' });
    }

    // Check ownership: review.user_id must match req.user.id OR user is admin
    if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Faqat izoh egasi o\'chira oladi' });
    }

    await reviewService.delete(reviewId, telegramId);
    res.json({ success: true, message: 'Izoh o\'chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
