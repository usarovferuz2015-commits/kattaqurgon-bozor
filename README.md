# Kattaqo'rg'on Bozori

Kattaqo'rg'on bozorining rasmiy Telegram Marketplace platformasi.

## 📋 Loyiha haqida

Bu loyiha Kattaqo'rg'on bozori uchun 24/7 ishlaydigan online marketplace platforma. 

**3 ta asosiy qismdan iborat:**
1. **Telegram Bot** - grammY framework, foydalanuvchilar bilan muloqot
2. **Telegram Web App** - React + TailwindCSS, marketplace UI
3. **Supabase Backend** - PostgreSQL, RLS, API

## 🚀 Tez boshlash

### Talablar
- Node.js >= 18
- Telegram Bot Token (BotFather)
- Supabase Project

### 1. Repositoriyani clone qilish
```bash
git clone https://github.com/username/kattaqurgon-bozori.git
cd kattaqurgon-bozori
```

### 2. Environment variables sozlash
```bash
cp server/.env.example server/.env
# .env faylini o'z ma'lumotlaringiz bilan to'ldiring
```

### 3. Ma'lumotlar bazasini sozlash
1. Supabase'da yangi project yarating
2. SQL Editor'ga `database/migrations/001_initial_schema.sql` ni yuklab ishga tushiring

### 4. Development rejimida ishga tushirish

```bash
# Barcha dependency'larni o'rnatish
npm run setup

# Backend + Bot ni ishga tushirish
npm run dev:server

# Frontend ni ishga tushirish (yangi terminalda)
npm run dev:client

# Admin panel (yangi terminalda)
npm run dev:admin
```

### 5. Browser'da ochish
- Frontend: http://localhost:5173
- Admin: http://localhost:5174
- API: http://localhost:3000/health

## 📁 Loyiha strukturasi

```
kattaqurgon-bozori/
├── client/                    # React Web App
│   ├── src/
│   │   ├── components/        # UI komponentlar
│   │   │   ├── ui/           # Umumiy UI (Header, BottomNav)
│   │   │   └── marketplace/  # Marketplace komponentlari
│   │   ├── pages/            # Sahifalar
│   │   ├── services/         # API xizmatlari
│   │   ├── store/            # Zustand store
│   │   └── utils/            # Yordamchi funksiyalar
│   └── ...
├── server/                    # Node.js + grammY backend
│   └── src/
│       ├── bot/              # Telegram Bot
│       ├── api/              # Express API routes
│       ├── services/         # Business logic
│       └── config.ts         # Konfiguratsiya
├── admin-panel/              # Admin React panel
│   └── src/
│       ├── pages/            # Admin sahifalari
│       ├── components/       # Admin komponentlari
│       └── services/         # API xizmatlari
├── database/                 # SQL migrations
│   └── migrations/           # Database schema
├── shared/                   # Umumiy TypeScript typelar
├── docs/                     # Hujjatlar
└── ...
```

## 🛠 Texnologiyalar

- **Frontend**: React, Vite, TailwindCSS, Telegram WebApp SDK
- **Backend**: Node.js, grammY, Express
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Railway (server), Vercel (frontend)

## 📊 Asosiy funksiyalar

- 🛍 Mahsulot katalogi (kategoriyalar bo'yicha)
- 🔍 Mahsulot qidirish
- 🛒 Savatcha (persistent)
- 👨‍💼 Sotuvchi paneli (do'kon boshqaruvi)
- 👑 Admin panel (to'liq boshqaruv)
- 📈 Analytics dashboard
- ⭐ Premium reklama tizimi
- 🖼 Banner va carousel

## 🔐 Xavfsizlik

- Supabase Row Level Security
- Role-based access (user, seller, admin)
- Admin Telegram ID tekshiruvi
- CORS protection
- Helmet middleware

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/amazing-feature`)
3. O'zgartirishlarni commit qiling (`git commit -m 'Add amazing feature'`)
4. Push qiling (`git push origin feature/amazing-feature`)
5. Pull Request yarating

## 📝 Litsenziya

MIT

## 📞 Aloqa

- Telegram: [@username](https://t.me/username)
- Email: example@email.com
