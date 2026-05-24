// ============================================
// Kattaqo'rg'on Bozori - Server Entry Point
// ============================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { startBot } from './bot';
import { analyticsService } from './services/analytics.service';

// Import routes
import productRoutes from './api/products';
import categoryRoutes from './api/categories';
import authRoutes from './api/auth';
import cartRoutes from './api/cart';
import sellerRoutes from './api/sellers';
import adminRoutes from './api/admin';

const app = express();

// === Middleware ===
app.use(helmet());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === Request logging ===
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// === API Routes ===
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);

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

// === Error handler ===
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: config.app.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// === Start server ===
function startServer() {
  app.listen(config.app.port, () => {
    console.log(`🚀 Server running on port ${config.app.port}`);
    console.log(`🌐 WebApp URL: ${config.app.webAppUrl}`);
    console.log(`📊 Admin URL: ${config.app.adminWebAppUrl}`);
    console.log(`🔧 Environment: ${config.app.nodeEnv}`);

    // Start daily stats updater (runs every hour)
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
  startBot();
  startServer();
} catch (error) {
  console.error('Failed to start application:', error);
  process.exit(1);
}

export default app;
