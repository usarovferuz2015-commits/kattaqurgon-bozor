// ============================================
// API Routes - Categories
// ============================================
import { Router, Request, Response } from 'express';
import { categoryService } from '../services/category.service';

const router = Router();

// GET /api/categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.getTree();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/categories/flat
router.get('/flat', async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAll();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/categories/featured
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.getFeatured();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getBySlug(String((req.params as any).slug));
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const children = await categoryService.getChildren(category.id);

    res.json({
      success: true,
      data: { ...category, children },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/categories
router.post('/', async (req: Request, res: Response) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const category = await categoryService.update(String((req.params as any).id), req.body);
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await categoryService.delete(String((req.params as any).id));
    res.json({ success: true, message: 'Kategoriya o\'chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
