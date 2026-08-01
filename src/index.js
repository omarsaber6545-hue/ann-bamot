const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config/config');
const Logger = require('./utils/logger');
const loadEvents = require('./handlers/eventHandler');

// إنشاء العميل وتحديد الـ Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

// معالجة استثناءات العمليات وتفادي التوقف الإجباري للخدمة
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err, origin) => {
  Logger.error(`Uncaught Exception at: ${origin}`, err);
});

// تحميل الأحداث وتدوير البوت
(async () => {
  try {
    loadEvents(client);

    if (!config.token) {
      Logger.error('CRITICAL: DISCORD_TOKEN is missing in environment variables / .env file!');
      process.exit(1);
    }

    await client.login(config.token);
  } catch (err) {
    Logger.error('Failed to log in to Discord:', err);
    process.exit(1);
  }
})();
