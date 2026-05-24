require('dotenv').config();
const { Bot, session, InlineKeyboard } = require('grammy');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;
const ADMIN_ID = 7121724430;

const bot = new Bot(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

bot.use(session({ initial: () => ({ step: 'idle' }) }));

bot.command('start', async (ctx) => {
    await ctx.reply('Assalomu alaykum! "Fayzli Savdo"ga xush kelibsiz!', {
        reply_markup: new InlineKeyboard().webApp('🛍 Bozorni ochish', 'https://fayzlisavdo.vercel.app')
    });
});

bot.command('admin', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('⛔ Ruxsat yo‘q.');
    await ctx.reply('👑 <b>Admin Panel</b>', { 
        parse_mode: 'HTML', 
        reply_markup: new InlineKeyboard().text('📂 Kategoriyalar', 'admin_categories') 
    });
});

bot.start();
const app = express();
app.listen(process.env.PORT || 3000);