require('dotenv').config();
const { Bot, session, InlineKeyboard } = require('grammy');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');

// Xavfsizlik uchun process.env dan o'qiymiz
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;
const ADMIN_ID = 7121724430;

const bot = new Bot(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

bot.use(session({
    initial: () => ({ step: 'idle', editCatId: null }),
}));

function isAdmin(ctx) { return ctx.from && ctx.from.id === ADMIN_ID; }
function resetSession(ctx) { ctx.session.step = 'idle'; ctx.session.editCatId = null; }

function adminMenu() {
    return new InlineKeyboard()
        .text('📂 Kategoriyalar', 'admin_categories').row()
        .text('➕ Kategoriya Qo\'shish', 'admin_add_cat').row()
        .text('❌ Yopish', 'admin_close_panel');
}

bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply('⛔ Ruxsat yo\'q.');
    resetSession(ctx);
    await ctx.reply('👑 <b>Admin Panel</b>', { parse_mode: 'HTML', reply_markup: adminMenu() });
});

// ... (qolgan funksiyalarini boyagi koddan olib, shu yerga qo'shib ketaverasiz) ...

bot.command('start', async (ctx) => {
    const from = ctx.from;
    await supabase.from('users').upsert({
        telegram_id: from.id,
        username: from.username,
        full_name: `${from.first_name || ''} ${from.last_name || ''}`.trim(),
        role: from.id === ADMIN_ID ? 'admin' : 'buyer'
    });

    await ctx.reply('Assalomu alaykum! "Fayzli Savdo"ga xush kelibsiz!', {
        reply_markup: new InlineKeyboard().webApp('🛍 Bozorni ochish', 'https://fayzlisavdo-1xk68vs09-feruz-usarov-s-projects.vercel.app')
    });
});

bot.start();
const app = express();
app.listen(process.env.PORT || 3000);