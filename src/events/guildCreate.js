const db = require('../database/db');
const Logger = require('../utils/logger');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    Logger.info(`Bot joined a new guild: ${guild.name} (ID: ${guild.id})`);
    // تهيئة سجل السيرفر في قاعدة البيانات تلقائيًا
    db.getGuildSettings(guild.id);
  }
};
