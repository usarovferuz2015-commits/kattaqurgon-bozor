// ============================================
// API Routes - Image Upload to Supabase Storage
// ============================================
import { Router, Request, Response } from 'express';
import { getSupabaseClient } from '../services/supabase';

const router = Router();

// Ensure storage bucket is created (safely)
async function ensureBucketExists() {
  const supabase = getSupabaseClient();
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === 'products');
    if (!exists) {
      console.log('Creating "products" storage bucket...');
      await supabase.storage.createBucket('products', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });
    }
  } catch (error) {
    console.warn('Failed to verify or create products bucket (it might already exist):', error);
  }
}

// POST /api/upload - Upload base64 image
router.post('/', async (req: Request, res: Response) => {
  try {
    const { file, fileName: requestedName } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Fayl (base64) jo\'natilmadi' });
    }

    // Parse base64
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let fileBuffer: Buffer;
    let contentType = 'image/jpeg';

    if (matches && matches.length === 3) {
      contentType = matches[1];
      fileBuffer = Buffer.from(matches[2], 'base64');
    } else {
      // Try raw base64
      fileBuffer = Buffer.from(file, 'base64');
    }

    // Ensure bucket exists
    await ensureBucketExists();

    // Generate unique name
    const fileExt = contentType.split('/')[1] || 'jpg';
    const uniqueName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = requestedName || uniqueName;

    const supabase = getSupabaseClient();
    
    // Upload buffer to Supabase Storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ success: false, error: 'Rasm yuklashda xatolik: ' + error.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        filePath,
      },
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
