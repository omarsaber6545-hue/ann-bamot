const cron = require('node-cron');
const moment = require('moment-timezone');
const { getPrayerTimes } = require('./aladhanService');
const { morningAzkar, eveningAzkar, randomAzkar } = require('../assets/azkarData');
const quranVerses = require('../assets/quranData');
const db = require('../database/db');
const Logger = require('../utils/logger');
const { 
  buildPrayerEmbed, 
  buildMorningAzkarEmbed, 
  buildEveningAzkarEmbed, 
  buildRandomDhikrEmbed, 
  buildQuranEmbed,
  buildFridayKahfEmbed, 
  buildFridayDuaEmbed 
} = require('../utils/embeds');

let lastDhikrIndex = -1;
let lastQuranIndex = -1;
let toggleFiveMinType = false;
const sentPrayerReminders = new Set();

/**
 * إرسال رسالة إلى القنوات المحددة حسب نوع التذكير (type: 'prayer' | 'azkar' | 'daily' | 'general')
 */
const broadcastToGuilds = async (client, embedSupplier, type = 'general', roleMention = false) => {
  const activeGuilds = db.getAllActiveGuilds();
  if (!activeGuilds || activeGuilds.length === 0) return;

  for (const guildData of activeGuilds) {
    try {
      // تحديد القناة المناسبة بناءً على الإعدادات المسجلة للنوع
      let targetChannelId = null;
      if (type === 'prayer') {
        targetChannelId = guildData.prayer_channel_id || guildData.channel_id;
      } else if (type === 'azkar') {
        targetChannelId = guildData.azkar_channel_id || guildData.channel_id;
      } else if (type === 'daily') {
        targetChannelId = guildData.daily_channel_id || guildData.channel_id;
      } else {
        targetChannelId = guildData.channel_id || guildData.prayer_channel_id || guildData.azkar_channel_id || guildData.daily_channel_id;
      }

      if (!targetChannelId) continue;

      const channel = await client.channels.fetch(targetChannelId).catch(() => null);
      if (!channel) continue;

      let content = '';
      if (roleMention && guildData.role_id) {
        content = `<@&${guildData.role_id}>`;
      }

      const embed = typeof embedSupplier === 'function' ? embedSupplier(guildData) : embedSupplier;
      await channel.send({ content, embeds: [embed] }).catch(err => {
        Logger.error(`Failed to send ${type} reminder in channel ${targetChannelId}:`, err);
      });
    } catch (err) {
      Logger.error(`Error processing guild ${guildData.guild_id}:`, err);
    }
  }
};

/**
 * تهيئة الجداول الزمنية
 */
const initScheduler = (client) => {
  Logger.info('Initializing Scheduler Service with Multi-Channel Routing...');

  // 1. التحديث اليومي لمنتصف الليل
  cron.schedule('0 0 * * *', async () => {
    Logger.info('Refreshing daily prayer times and resetting reminder cache...');
    sentPrayerReminders.clear();
    await getPrayerTimes();
  }, { timezone: 'Africa/Cairo' });

  // 2. مواقيت الصلاة (تُرسل في قناة أوقات الصلاة المخصصة)
  cron.schedule('* * * * *', async () => {
    try {
      const timings = await getPrayerTimes();
      if (!timings) return;

      const now = moment().tz('Africa/Cairo');
      const timeNowStr = now.format('HH:mm');
      const todayStr = now.format('YYYY-MM-DD');

      const prayers = [
        { key: 'Fajr', name: 'الفجر' },
        { key: 'Sunrise', name: 'الشروق' },
        { key: 'Dhuhr', name: 'الظهر' },
        { key: 'Asr', name: 'العصر' },
        { key: 'Maghrib', name: 'المغرب' },
        { key: 'Isha', name: 'العشاء' }
      ];

      for (const prayer of prayers) {
        const prayerTime = timings[prayer.key].split(' ')[0];
        const reminderKey = `${todayStr}-${prayer.key}`;

        if (prayerTime === timeNowStr && !sentPrayerReminders.has(reminderKey)) {
          sentPrayerReminders.add(reminderKey);
          Logger.info(`Triggering prayer reminder for ${prayer.name} at ${timeNowStr}`);

          const current12H = now.format('hh:mm A') === 'hh:mm AM' ? `${now.format('hh:mm')} ص` : `${now.format('hh:mm')} م`;
          const embed = buildPrayerEmbed(prayer.name, current12H);

          await broadcastToGuilds(client, embed, 'prayer', true);
        }
      }
    } catch (err) {
      Logger.error('Error during minute-by-minute prayer check:', err);
    }
  }, { timezone: 'Africa/Cairo' });

  // 3. التذكير التلقائي كل 5 دقائق للقرآن والأذكار (تُرسل في قناة الأذكار المخصصة)
  cron.schedule('*/5 * * * *', async () => {
    Logger.info('Triggering 5-minute Quran/Azkar broadcast...');
    let embed;

    if (toggleFiveMinType) {
      let qIndex;
      do {
        qIndex = Math.floor(Math.random() * quranVerses.length);
      } while (qIndex === lastQuranIndex && quranVerses.length > 1);
      lastQuranIndex = qIndex;
      embed = buildQuranEmbed(quranVerses[qIndex]);
    } else {
      let dIndex;
      do {
        dIndex = Math.floor(Math.random() * randomAzkar.length);
      } while (dIndex === lastDhikrIndex && randomAzkar.length > 1);
      lastDhikrIndex = dIndex;
      embed = buildRandomDhikrEmbed(randomAzkar[dIndex]);
    }

    toggleFiveMinType = !toggleFiveMinType;
    await broadcastToGuilds(client, embed, 'azkar', false);
  }, { timezone: 'Africa/Cairo' });

  // 4. أذكار الصباح يوميًا (06:30 صباحًا) (تُرسل في قناة الأذكار اليومية)
  cron.schedule('30 6 * * *', async () => {
    Logger.info('Triggering Morning Azkar broadcast...');
    const embed = buildMorningAzkarEmbed(morningAzkar);
    await broadcastToGuilds(client, embed, 'daily', false);
  }, { timezone: 'Africa/Cairo' });

  // 5. أذكار المساء يوميًا (04:30 مساءً) (تُرسل في قناة الأذكار اليومية)
  cron.schedule('30 16 * * *', async () => {
    Logger.info('Triggering Evening Azkar broadcast...');
    const embed = buildEveningAzkarEmbed(eveningAzkar);
    await broadcastToGuilds(client, embed, 'daily', false);
  }, { timezone: 'Africa/Cairo' });

  // 6. سورة الكهف والصلاة على النبي يوم الجمعة (08:00 صباحًا)
  cron.schedule('0 8 * * 5', async () => {
    Logger.info('Triggering Friday Surah Al-Kahf & Salawat reminder...');
    const embed = buildFridayKahfEmbed();
    await broadcastToGuilds(client, embed, 'daily', false);
  }, { timezone: 'Africa/Cairo' });

  // 7. ساعة الاستجابة يوم الجمعة (05:00 مساءً)
  cron.schedule('0 17 * * 5', async () => {
    Logger.info('Triggering Friday Dua hour reminder...');
    const embed = buildFridayDuaEmbed();
    await broadcastToGuilds(client, embed, 'daily', false);
  }, { timezone: 'Africa/Cairo' });

  Logger.info('Multi-Channel Scheduler active and running.');
};

module.exports = {
  initScheduler
};
