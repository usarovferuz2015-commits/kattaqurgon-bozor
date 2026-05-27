// ============================================
// API Routes - Product Reviews & Ratings
// ============================================
import { Router, Request, Response } from 'express';
import { reviewService } from '../services/review.service';

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
router.post('/', async (req: Request, res: Response) => {
  try {
    const { telegram_id, product_id, rating, comment } = req.body;

    if (!telegram_id || !product_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'telegram_id, product_id va rating majburiy',
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
router.get('/:productId/my', async (req: Request, res: Response) => {
  try {
    const productId = (req.params as any).productId;
    const telegramId = parseInt(req.query.telegram_id as string);

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
router.delete('/:reviewId', async (req: Request, res: Response) => {
  try {
    const reviewId = (req.params as any).reviewId;
    const telegramId = parseInt(req.body.telegram_id);

    if (!telegramId) {
      return res.status(400).json({ success: false, error: 'telegram_id majburiy' });
    }

    await reviewService.delete(reviewId, telegramId);
    res.json({ success: true, message: 'Izoh o\'chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
