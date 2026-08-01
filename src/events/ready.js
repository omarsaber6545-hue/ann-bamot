const { ActivityType } = require('discord.js');
const Logger = require('../utils/logger');
const loadCommands = require('../handlers/commandHandler');
const { initScheduler } = require('../services/schedulerService');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    Logger.info(`Logged in successfully as ${client.user.tag}!`);

    // إعداد حالة البوت (Presence)
    client.user.setPresence({
      activities: [{ name: 'مواقيت الصلاة والأذكار 🕌 | /help', type: ActivityType.Watching }],
      status: 'online'
    });

    // تسجيل الأوامر عند الجاهزية
    await loadCommands(client);

    // بدء خدمة الجدولة الزمنية
    initScheduler(client);
  }
};
