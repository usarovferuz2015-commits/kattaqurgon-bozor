// ============================================
// Telegram Bot - Main Entry
// ============================================
import { Bot, session, InlineKeyboard, webhookCallback, type SessionFlavor, type Context } from 'grammy';
import { config, isAdmin } from '../config';
import { userService } from '../services/user.service';
import { sellerService } from '../services/seller.service';
import { categoryService } from '../services/category.service';
import { productService } from '../services/product.service';
import { adminService } from '../services/admin.service';

interface SessionData {
  step: string;
  sellerForm?: Record<string, string>;
  productForm?: Record<string, any>;
  replyToBuyer?: { buyerTelegramId: number; buyerName: string; productName: string };
}

type MyContext = Context & SessionFlavor<SessionData>;

const WEB_APP_URL = 'https://kattaqurgon-bozor.vercel.app';
const ADMIN_WEB_APP_URL = config.app.adminWebAppUrl;

export function createBot(): Bot<MyContext> {
  const bot = new Bot<MyContext>(config.bot.token);

  // Global error handler
  bot.catch((err) => {
    console.error('Bot error (ignored):', err.error instanceof Error ? err.error.message : 'Unknown error');
  });

  bot.use(session({ initial: (): SessionData => ({ step: 'idle' }) }));

  // === /start command ===
  bot.command('start', async (ctx) => {
    console.log(`[Bot] /start received from ${ctx.from?.id}`);
    try {
      const telegramId = ctx.from!.id;
      const user = await userService.findOrCreate(telegramId, {
        username: ctx.from!.username || undefined,
        first_name: ctx.from!.first_name,
        last_name: ctx.from!.last_name,
        language_code: ctx.from!.language_code,
      });
 
      const keyboard = new InlineKeyboard()
        .row(
          { text: '🛍 Katalog', web_app: { url: `${WEB_APP_URL}?user=${telegramId}` } }
        )
        .row(
          { text: '👨‍💼 Sotuvchi Paneli', web_app: { url: `${WEB_APP_URL}/seller?user=${telegramId}` } }
        )
        .row(
          { text: '🏪 Do\'kon ochish', callback_data: 'seller_register' }
        );
 
      await ctx.reply(
        `Assalomu alaykum, ${user.first_name || 'xaridor'}! 👋\n\n` +
        `Kattaqo'rgon bozorining rasmiy online platformasiga xush kelibsiz!\n\n` +
        `Bu yerda siz:\n` +
        `✅ Bozordagi barcha mahsulotlarni ko'rishingiz\n` +
        `✅ Arzon narxlardagi tovarlarni topishingiz\n` +
        `✅ Sotuvchilar bilan bevosita bog'lanishingiz\n` +
        `✅ Sevimli mahsulotlarni saqlashingiz mumkin\n\n` +
        `🛍 Quyidagi bo'limlardan birini tanlang:`,
        { reply_markup: keyboard }
      );
    } catch (error) {
      console.error('[Bot] /start error:', error);
      await ctx.reply('❌ Kechirasiz, xatolik yuz berdi. Iltimos keyinroq urinib ko\'ring.');
    }
  });


  // === /admin command ===
  bot.command('admin', async (ctx) => {
    console.log(`[Bot] /admin received from ${ctx.from?.id}`);
    try {
      const telegramId = ctx.from!.id;
 
      if (!isAdmin(telegramId)) {
        await ctx.reply('⛔ Siz admin emassiz. Bu buyruq faqat adminlar uchun.');
        return;
      }
 
      const keyboard = new InlineKeyboard()
        .row(
          { text: '📊 Admin Panel', web_app: { url: `${ADMIN_WEB_APP_URL}` } }
        )
        .row(
          { text: '📂 Kategoriyalar', callback_data: 'admin_categories' },
          { text: '🏪 Sotuvchilar', callback_data: 'admin_sellers' }
        )
        .row(
          { text: '📢 Premium Reklama', callback_data: 'admin_ads' },
          { text: '🖼 Bannerlar', callback_data: 'admin_banners' }
        )
        .row(
          { text: '📈 Statistika', callback_data: 'admin_stats' }
        );
 
      await ctx.reply(
        `👑 Admin Panelga xush kelibsiz!\n\n` +
        `Siz quyidagilarni boshqarishingiz mumkin:\n` +
        `• Kategoriyalar (qo'shish, tahrirlash, o'chirish)\n` +
        `• Sotuvchilar (tasdiqlash, boshqarish)\n` +
        `• Reklamalar (premium reklamalarni boshqarish)\n` +
        `• Bannerlar (slider rasmlari)\n` +
        `• Statistika (marketplace analitikasi)`,
        { reply_markup: keyboard, parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('[Bot] /admin error:', error);
      await ctx.reply('❌ Kechirasiz, xatolik yuz berdi.');
    }
  });


  // === /help command ===
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `🤖 Kattaqo'rg'on Bozori Boti\n\n` +
      `Buyruqlar:\n` +
      `/start - Botni ishga tushirish\n` +
      `/katalog - Mahsulotlar katalogi\n` +
      `/sotuvchi - Sotuvchi paneli\n` +
      `/admin - Admin panel (faqat adminlar)\n` +
      `/help - Yordam\n\n` +
      `💡 Bot orqali siz:\n` +
      `• Mahsulotlarni ko'rishingiz\n` +
      `• Sotuvchilar bilan bog'lanishingiz\n` +
      `• O'z do'koningizni ochishingiz mumkin`
    );
  });

  bot.command('katalog', async (ctx) => {
    const telegramId = ctx.from!.id;
    const keyboard = new InlineKeyboard().row(
      { text: '🛍 Katalogni ochish', web_app: { url: `${WEB_APP_URL}?user=${telegramId}` } }
    );
    await ctx.reply('Mahsulotlar katalogini ochish uchun tugmani bosing:', { reply_markup: keyboard });
  });

  bot.command('sotuvchi', async (ctx) => {
    const telegramId = ctx.from!.id;
    const keyboard = new InlineKeyboard().row(
      { text: '👨‍💼 Sotuvchi panelini ochish', web_app: { url: `${WEB_APP_URL}/seller?user=${telegramId}` } }
    );
    await ctx.reply('Sotuvchi panelini ochish uchun tugmani bosing:', { reply_markup: keyboard });
  });

  // === Callback Query Handlers ===
  bot.callbackQuery('open_catalog', async (ctx) => {
    await ctx.answerCallbackQuery({ text: '🛍 Katalog ochilmoqda...' });
    await ctx.reply(
      '🛍 Katalog\n\n' +
      'Hozircha mahsulotlar katalogi faqat orqali mavjud. Tez kunda WebApp versiyasi ishga tushadi!\n\n' +
      'Quyidagilarni qilishingiz mumkin:\n' +
      '• /katalog - Mahsulotlar ro\'yxati\n' +
      '• /search - Qidirish\n' +
      '• /sotuvchi - Sotuvchi paneli'
    );
  });

  bot.callbackQuery('open_seller', async (ctx) => {
    await ctx.answerCallbackQuery({ text: '👨‍💼 Sotuvchi paneli...' });
    const telegramId = ctx.from!.id;
    const existingSeller = await sellerService.getByTelegramId(telegramId);

    if (existingSeller) {
      await ctx.reply(
        `🏪 Do'koningiz: ${existingSeller.store_name}\n\n` +
        `Mahsulotlar: ${existingSeller.total_products}\n` +
        `Reyting: ${existingSeller.rating}\n` +
        `Holat: ${existingSeller.is_active ? '✅ Faol' : '❌ Bloklangan'}`,
        {
          reply_markup: new InlineKeyboard()
            .row({ text: '📦 Mahsulotlarim', callback_data: 'seller_dashboard' })
            .row({ text: '✏️ Do\'konni tahrirlash', callback_data: 'seller_edit' })
        }
      );
    } else {
      await ctx.reply(
        '👨‍💼 Sotuvchi Paneli\n\n' +
        'Do\'kon ochish orqali o\'z mahsulotlaringizni butun bozorga ko\'rsating!\n\n' +
        'Imkoniyatlar:\n' +
        '✅ Mahsulot qo\'shish\n' +
        '✅ Mahsulotlarni tahrirlash\n' +
        '✅ Statistika ko\'rish\n' +
        '✅ Xaridorlar bilan bog\'lanish',
        {
          reply_markup: new InlineKeyboard().row(
            { text: '🏪 Do\'kon ochish', callback_data: 'seller_register' }
          )
        }
      );
    }
  });

  bot.callbackQuery(/admin_(.+)/, async (ctx) => {
    const telegramId = ctx.from!.id;
    if (!isAdmin(telegramId)) {
      await ctx.answerCallbackQuery({ text: '⛔ Ruxsat yo\'q!' });
      return;
    }

    const action = ctx.match[1];
    await ctx.answerCallbackQuery();

    switch (action) {
      case 'categories':
        await showAdminCategories(ctx);
        break;
      case 'sellers':
        await showAdminSellers(ctx);
        break;
      case 'ads':
        await ctx.reply('📢 Premium reklamalarni boshqarish:', {
          reply_markup: new InlineKeyboard().row(
            { text: '📢 Reklama panelini ochish', web_app: { url: `${ADMIN_WEB_APP_URL}/ads?admin=${telegramId}` } }
          )
        });
        break;
      case 'banners':
        await ctx.reply('🖼 Bannerlarni boshqarish:', {
          reply_markup: new InlineKeyboard().row(
            { text: '🖼 Banner panelini ochish', web_app: { url: `${ADMIN_WEB_APP_URL}/banners?admin=${telegramId}` } }
          )
        });
        break;
      case 'stats':
        await ctx.reply('📈 Statistika panelini ochish:', {
          reply_markup: new InlineKeyboard().row(
            { text: '📈 Statistika', web_app: { url: `${ADMIN_WEB_APP_URL}/analytics?admin=${telegramId}` } }
          )
        });
        break;
    }
  });

  // === Reply to buyer handler ===
  bot.callbackQuery(/^reply_(\d+)/, async (ctx) => {
    const buyerTelegramId = parseInt(ctx.match[1]);
    const buyerName = ctx.session.replyToBuyer?.buyerName || 
      ctx.callbackQuery.message?.text?.match(/👤 Xaridor: (.+)/)?.[1] || 'Xaridor';
    const productName = ctx.session.replyToBuyer?.productName ||
      ctx.callbackQuery.message?.text?.match(/📦 Mahsulot: (.+)/)?.[1] || 'Mahsulot';
    
    ctx.session.replyToBuyer = { buyerTelegramId, buyerName, productName };
    ctx.session.step = 'reply_to_buyer';
    
    await ctx.answerCallbackQuery({ text: '✏️ Javobingizni yozing' });
    await ctx.reply(
      `✏️ <b>${buyerName}</b> ga javob yozing:\n\n` +
      `Javobingiz to'g'ridan-to'g'ri xaridorga yuboriladi.`,
      { parse_mode: 'HTML' }
    );
  });

  bot.callbackQuery(/seller_(.+)/, async (ctx) => {
    const action = ctx.match[1];
    const telegramId = ctx.from!.id;
    await ctx.answerCallbackQuery();

    const existingSeller = await sellerService.getByTelegramId(telegramId);

    if (action === 'register') {
      if (existingSeller) {
        await ctx.reply(
          `Siz allaqachon sotuvchisiz! 🏪\n\n` +
          `Do'koningiz: ${existingSeller.store_name}\n` +
          `Mahsulotlar: ${existingSeller.total_products}\n` +
          `Holat: ${existingSeller.is_active ? '✅ Faol' : '❌ Bloklangan'}`,
          {
            reply_markup: new InlineKeyboard().row(
              { text: '👨‍💼 Sotuvchi paneli', web_app: { url: `${WEB_APP_URL}/seller?user=${telegramId}&role=seller` } }
            )
          }
        );
        return;
      }
      ctx.session.step = 'seller_name';
      await ctx.reply(
        'Do\'kon ochish uchun quyidagi ma\'lumotlarni kiriting.\n\n' +
        '1/4: Do\'kon nomini kiriting:'
      );
      return;
    }

    const user = await userService.getByTelegramId(telegramId);
    if (!user) return;

    switch (action) {
      case 'register':
        ctx.session.step = 'seller_name';
        await ctx.reply(
          'Do\'kon ochish uchun quyidagi ma\'lumotlarni kiriting.\n\n' +
          '1/4: Do\'kon nomini kiriting:'
        );
        break;
      case 'dashboard':
        await ctx.reply('Sotuvchi panelini oching:', {
          reply_markup: new InlineKeyboard().row(
            { text: '👨‍💼 Panelni ochish', web_app: { url: `${WEB_APP_URL}/seller?user=${telegramId}` } }
          )
        });
        break;
    }
  });

  // === Text message handler for seller registration ===
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    const telegramId = ctx.from!.id;
    const session_data = ctx.session;

    if (session_data.step === 'reply_to_buyer' && session_data.replyToBuyer) {
      const { buyerTelegramId, buyerName, productName } = session_data.replyToBuyer;
      session_data.step = 'idle';
      session_data.replyToBuyer = undefined;
      try {
        const bot = getBot();
        await bot.api.sendMessage(buyerTelegramId,
          `📩 Sotuvchidan javob:\n\n` +
          `${text}\n\n` +
          `📦 Mahsulot: ${productName}\n` +
          `💬 Sotuvchiga javob yozish: tg://user?id=${telegramId}`,
          { parse_mode: 'HTML' }
        );
        await ctx.reply('✅ Javobingiz xaridorga yuborildi!', {
          reply_markup: {
            inline_keyboard: [[
              { text: '✏️ Yana javob yozish', callback_data: `reply_${buyerTelegramId}` }
            ]]
          }
        });
      } catch (error) {
        console.error('Failed to send reply:', error);
        await ctx.reply('❌ Xatolik yuz berdi. Xaridor botni bloklagan bo\'lishi mumkin.');
      }
      return;
    }

    if (session_data.step === 'seller_name') {
      session_data.sellerForm = { store_name: text };
      session_data.step = 'seller_phone';
      await ctx.reply('2/4: Telefon raqamingizni kiriting (masalan: +998901234567):');
    } else if (session_data.step === 'seller_phone') {
      session_data.sellerForm!['store_phone'] = text;
      session_data.step = 'seller_address';
      await ctx.reply('3/4: Do\'kon manzilini kiriting:');
    } else if (session_data.step === 'seller_address') {
      session_data.sellerForm!['store_address'] = text;
      session_data.step = 'seller_description';
      await ctx.reply('4/4: Do\'kon haqida qisqacha ma\'lumot kiriting:');
    } else if (session_data.step === 'seller_description') {
      session_data.sellerForm!['store_description'] = text;
      session_data.step = 'idle';

      const user = await userService.getByTelegramId(telegramId);
      if (!user) return;

      try {
        const seller = await sellerService.create(telegramId, user.id, {
          store_name: session_data.sellerForm!.store_name,
          store_slug: session_data.sellerForm!.store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          store_phone: session_data.sellerForm!.store_phone,
          store_address: session_data.sellerForm!.store_address,
          store_description: session_data.sellerForm!.store_description,
        });

        const keyboard = new InlineKeyboard().row(
          { text: '👨‍💼 Sotuvchi paneli', web_app: { url: `${WEB_APP_URL}/seller` } }
        );

        await ctx.reply(
          `✅ Tabriklaymiz! Do'koningiz muvaffaqiyatli ochildi!\n\n` +
          `🏪 Do'kon: ${seller.store_name}\n` +
          `📞 Telefon: ${seller.store_phone}\n` +
          `📍 Manzil: ${seller.store_address}\n\n` +
          `Endi siz:\n` +
          `• Mahsulot qo'shishingiz\n` +
          `• Mahsulotlarni tahrirlashingiz\n` +
          `• Statistika ko'rishingiz mumkin`,
          { reply_markup: keyboard }
        );
      } catch (error) {
        await ctx.reply('❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
      }
    }
  });

  return bot;
}

// === Admin callbacks ===
async function showAdminCategories(ctx: MyContext) {
  const categories = await categoryService.getAll();
  const rootCategories = categories.filter(c => !c.parent_id);

  if (rootCategories.length === 0) {
    await ctx.reply('📂 Hozircha kategoriyalar mavjud emas.', {
      reply_markup: new InlineKeyboard().row(
        { text: '➕ Kategoriya qo\'shish', web_app: { url: `${ADMIN_WEB_APP_URL}/categories?admin=${ctx.from!.id}` } }
      )
    });
    return;
  }

  let message = '📂 Kategoriyalar:\n\n';
  for (const cat of rootCategories) {
    const children = categories.filter(c => c.parent_id === cat.id);
    message += `📁 ${cat.icon || ''} ${cat.name_uz} (${cat.product_count} ta mahsulot)\n`;
    for (const child of children) {
      message += `  └ 📂 ${child.icon || ''} ${child.name_uz}\n`;
    }
    message += '\n';
  }

  await ctx.reply(message, {
    reply_markup: new InlineKeyboard().row(
      { text: '➕ Kategoriya qo\'shish', web_app: { url: `${ADMIN_WEB_APP_URL}/categories?admin=${ctx.from!.id}` } }
    )
  });
}

async function showAdminSellers(ctx: MyContext) {
  const { data: sellers } = await sellerService.getAll(1, 10);

  if (sellers.length === 0) {
    await ctx.reply('🏪 Hozircha sotuvchilar mavjud emas.');
    return;
  }

  let message = '🏪 Sotuvchilar:\n\n';
  for (const seller of sellers) {
    message += `${seller.is_verified ? '✅' : '⏳'} ${seller.store_name}\n`;
    message += `   Mahsulotlar: ${seller.total_products} | Reyting: ${seller.rating}\n`;
    message += `   Status: ${seller.is_active ? 'Aktiv' : 'Bloklangan'}\n\n`;
  }

  const keyboard = new InlineKeyboard()
    .row({ text: '👁 Barcha sotuvchilar', web_app: { url: `${ADMIN_WEB_APP_URL}/sellers?admin=${ctx.from!.id}` } });

  await ctx.reply(message, { reply_markup: keyboard });
}

let botInstance: Bot<MyContext> | null = null;

export function getBot(): Bot<MyContext> {
  if (!botInstance) {
    throw new Error('Bot not initialized. Call startBot() first.');
  }
  return botInstance;
}

export async function notifyContactSeller(
  sellerTelegramId: number,
  buyerTelegramId: number,
  buyerName: string,
  productName: string,
  productSlug: string
) {
  const bot = getBot();
  const webAppUrl = config.app.webAppUrl;

  // Send notification to seller
  try {
    await bot.api.sendMessage(
      sellerTelegramId,
      `👋 Yangi xaridor!\n\n` +
      `📦 Mahsulot: <b>${productName}</b>\n` +
      `👤 Xaridor: ${buyerName}\n\n` +
      `Xaridorga javob yozish uchun pastdagi tugmani bosing:\n` +
      `🛍 Mahsulot: ${webAppUrl}/product/${productSlug}`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '✏️ Javob yozish', callback_data: `reply_${buyerTelegramId}` }
          ]]
        }
      }
    );
  } catch (error) {
    console.error(`Failed to notify seller ${sellerTelegramId}:`, error);
  }

  // Send confirmation to buyer
  try {
    await bot.api.sendMessage(
      buyerTelegramId,
      `✅ Xabaringiz sotuvchiga yuborildi!\n\n` +
      `Sotuvchi tez orada siz bilan bog'lanadi.\n\n` +
      `Agar sotuvchi javob bermasa, quyidagi tugma orqali uning do'koniga o'tishingiz mumkin:`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🛍 Sotuvchi do\'koni', web_app: { url: `${webAppUrl}?user=${buyerTelegramId}` } }
          ]]
        }
      }
    );
  } catch (error) {
    console.error(`Failed to confirm buyer ${buyerTelegramId}:`, error);
  }
}

export function startBot(app?: import('express').Application) {
  const bot = createBot();
  botInstance = bot;

  if (config.app.nodeEnv === 'production') {
    // Webhook mode (Railway)
    if (app) {
      app.post('/bot-webhook', webhookCallback(bot, 'express'));
    }
    if (config.app.botWebhookUrl) {
      bot.api.setWebhook(config.app.botWebhookUrl)
        .then(() => console.log(`🔗 Bot webhook set to: ${config.app.botWebhookUrl}`))
        .catch(err => console.error('Failed to set webhook:', err));
    }
    console.log('🤖 Bot started (webhook mode)');
  } else {
    // Polling mode (local development)
    bot.start({ onStart: () => console.log('🤖 Bot started (polling)') });
  }

  return bot;
}
