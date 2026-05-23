const { Bot, session } = require('grammy');
const express = require('express');
require('dotenv').config();

// 1. O'zgaruvchilarni olish
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 8080;

const bot = new Bot(BOT_TOKEN);
const app = express();

app.use(express.json());

// 2. Oddiy bot ishlashini tekshirish uchun start
bot.command('start', (ctx) => {
    ctx.reply('Assalomu alaykum! Kattaqo\'rg\'on bozoriga xush kelibsiz!');
});

// 3. Railway serveri uchun
app.get('/', (req, res) => {
    res.send('Kattaqo\'rg\'on Bozori boti ishlamoqda!');
});

// 4. Bot va Serverni ishga tushirish
bot.start({
    onStart: (botInfo) => console.log(`🤖 Bot @${botInfo.username} ishga tushdi!`)
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server ${PORT} portida tinglamoqda...`);
});
