// ============================================
// Kattaqo'rg'on Bozori - Server Entry Point
// ============================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { startBot } from './bot';
import { analyticsService } from './services/analytics.service';
import { globalErrorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';

// Import routes
import productRoutes from './api/products';
import categoryRoutes from './api/categories';
import authRoutes from './api/auth';
import cartRoutes from './api/cart';
import sellerRoutes from './api/sellers';
import adminRoutes from './api/admin';
import uploadRoutes from './api/upload';
import reviewRoutes from './api/reviews';

const app = express();

// Trust proxy headers (required for Railway behind nginx/F5)
app.set('trust proxy', 1);

// === Security Middleware ===
app.use(helmet()); // Security headers

// Rate limiting: Global limit to prevent brute force/DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});
app.use(limiter);

app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));

// Request size limit
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === Request logging ===
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// === API Routes ===
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', authMiddleware, cartRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/reviews', authMiddleware, reviewRoutes);

// === Health check ===
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// === API info ===
app.get('/api', (_req, res) => {
  res.json({
    name: 'Kattaqo\'rg\'on Bozori API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      auth: '/api/auth',
      cart: '/api/cart',
      sellers: '/api/sellers',
      admin: '/api/admin',
      health: '/api/health',
    },
  });
});

// === Global Error Handler (MUST be last) ===
app.use(globalErrorHandler);

// === Start server ===
function startServer() {
  app.listen(config.app.port, () => {
    console.log(`🚀 Server running on port ${config.app.port}`);
    console.log(`🌐 WebApp URL: ${config.app.webAppUrl}`);
    console.log(`📊 Admin URL: ${config.app.adminWebAppUrl}`);
    console.log(`🔧 Environment: ${config.app.nodeEnv}`);

    setInterval(async () => {
      try {
        await analyticsService.updateDailyStats();
      } catch (error) {
        console.error('Failed to update daily stats:', error);
      }
    }, 60 * 60 * 1000);
  });
}

// === Initialize ===
try {
  startBot(app);
  startServer();
} catch (error) {
  console.error('Failed to start application:', error);
  process.exit(1);
}

export default app;
