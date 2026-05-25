// ============================================
// Environment & Config
// ============================================
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  bot: {
    token: process.env.BOT_TOKEN || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    webAppUrl: process.env.WEB_APP_URL || 'https://kattaqurgon-bozori.vercel.app',
    adminWebAppUrl: process.env.ADMIN_WEB_APP_URL || 'https://kattaqurgon-bozori-admin.vercel.app',
  },
  admin: {
    telegramIds: (process.env.ADMIN_TELEGRAM_IDS || '')
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id)),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'kattaqurgon-bozori-secret-key-change-in-production',
  },
  cors: {
    allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,tg://,https://t.me,https://client-olive-six-20.vercel.app,https://admin-panel-ten-sigma-23.vercel.app')
      .split(',')
      .map(s => s.trim()),
  },
};

export function isAdmin(telegramId: number): boolean {
  return config.admin.telegramIds.includes(telegramId);
}
