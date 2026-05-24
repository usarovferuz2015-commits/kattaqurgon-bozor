# Kattaqo'rg'on Bozori - Railway Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

## 1. Railway orqali deploy qilish

### Backend (Server + Bot)

```bash
railway login
railway init
railway up
```

Railway dashboardda quyidagi environment variablesni sozlang:

| Variable | Tavsif |
|----------|--------|
| `BOT_TOKEN` | Telegram bot token (BotFather dan oling) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key |
| `PORT` | 3000 (Railway auto set qiladi) |
| `WEB_APP_URL` | Frontend Vercel URL |
| `ADMIN_WEB_APP_URL` | Admin panel Vercel URL |
| `ADMIN_TELEGRAM_IDS` | Admin Telegram IDlari (vergul bilan) |
| `JWT_SECRET` | Maxfiy kalit (o'zgartiring!) |
| `CORS_ORIGINS` | Ruxsat etilgan domenlar |

### Frontend (Vercel)

```bash
cd client
npx vercel --prod
```

### Admin Panel (Vercel)

```bash
cd admin-panel
npx vercel --prod
```

## 2. Supabase Setup

1. https://supabase.com da yangi project yarating
2. SQL Editor ga o'tib, `database/migrations/001_initial_schema.sql` faylidagi kodni yuklab ishga tushiring
3. Project Settings > API dan URL va keyslarni oling
4. Environment variables ga qo'shing

## 3. BotFather Setup

1. Telegram'da @BotFather ga yozing
2. `/newbot` - yangi bot yarating
3. Bot tokenini oling va `.env` ga qo'ying
4. `/setdomain` - bot domainini sozlang (WebApp ishlashi uchun)
5. Botga rasm va description qo'shing

## 4. GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit: Kattaqo'rg'on Bozori marketplace"
git branch -M main
git remote add origin https://github.com/username/kattaqurgon-bozori.git
git push -u origin main
```

## 5. Production Checklist

- [ ] BOT_TOKEN o'rnatilgan
- [ ] SUPABASE credentials to'g'ri
- [ ] ADMIN_TELEGRAM_IDS to'g'ri
- [ ] WEB_APP_URL frontend URL ga teng
- [ ] JWT_SECRET o'zgartirilgan
- [ ] Supabase migration ishga tushirilgan
- [ ] RLS policies enabled
- [ ] CORS origins to'g'ri
- [ ] BotFather WebApp domain sozlangan
- [ ] SSL/HTTPS yoqilgan
- [ ] Database indexes yaratilgan
