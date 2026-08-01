const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const { getFormattedHijriDate, getFormattedGregorianDate, formatTime12H } = require('./dateUtils');

/**
 * إنشاء الـ Embed الأساسي بلون وقالب إسلامي فاخر
 */
const createBaseEmbed = () => {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setFooter({ text: config.footerText })
    .setTimestamp();
};

/**
 * إمبيد التذكير بالصلاة
 */
const buildPrayerEmbed = (prayerName, current12HTime) => {
  return createBaseEmbed()
    .setTitle(`🕌 حان الآن موعد أذان ${prayerName}`)
    .setDescription(`> **«إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا»**\n\nأخي المسلم / أختي المسلمة، حان الآن وقت **صلاة ${prayerName}** بحسب التوقيت المحلي لمدينة القاهرة وضواحيها.`)
    .addFields(
      { name: '⏰ الوقت الحالي', value: `\`${current12HTime}\``, inline: true },
      { name: '📅 التاريخ الهجري', value: `\`${getFormattedHijriDate()}\``, inline: true },
      { name: '🗓️ التاريخ الميلادي', value: `\`${getFormattedGregorianDate()}\``, inline: false },
      { name: '✨ تذكرة', value: 'أسبغ الوضوء، واستعد للصلاة في الجماعة، ولا تنسَ أذكار بعد الصلاة.', inline: false }
    );
};

/**
 * إمبيد جدول مواقيت الصلاة لليوم
 */
const buildPrayerTimesEmbed = (timings) => {
  return createBaseEmbed()
    .setTitle('🕋 مواقيت الصلاة لليوم — القاهرة ومصر')
    .setDescription(`> 📅 **التاريخ الهجري:** ${getFormattedHijriDate()}\n> 🗓️ **التاريخ الميلادي:** ${getFormattedGregorianDate()}`)
    .addFields(
      { name: '🌅 الفجر', value: `\`${formatTime12H(timings.Fajr)}\``, inline: true },
      { name: '☀️ الشروق', value: `\`${formatTime12H(timings.Sunrise)}\``, inline: true },
      { name: '🌞 الظهر', value: `\`${formatTime12H(timings.Dhuhr)}\``, inline: true },
      { name: '🌤️ العصر', value: `\`${formatTime12H(timings.Asr)}\``, inline: true },
      { name: '🌅 المغرب', value: `\`${formatTime12H(timings.Maghrib)}\``, inline: true },
      { name: '🌙 العشاء', value: `\`${formatTime12H(timings.Isha)}\``, inline: true }
    );
};

/**
 * إمبيد الصلاة التالية والعد التنازلي
 */
const buildNextPrayerEmbed = (nextDetails) => {
  return createBaseEmbed()
    .setTitle('⏳ الصلاة القادمة والعد التنازلي')
    .setDescription(`الصلاة القادمة هي **صلاة ${nextDetails.nextPrayerName}**`)
    .addFields(
      { name: '🕌 الصلاة القادمة', value: `\`${nextDetails.nextPrayerName}\``, inline: true },
      { name: '⏰ موعد الصلاة', value: `\`${nextDetails.time12H}\``, inline: true },
      { name: '⏱️ المتبقي على الأذان', value: `\`${nextDetails.countdown}\``, inline: false },
      { name: '📅 التاريخ الهجري اليوم', value: `\`${getFormattedHijriDate()}\``, inline: false }
    );
};

/**
 * إمبيد أذكار الصباح
 */
const buildMorningAzkarEmbed = (azkarList) => {
  const embed = createBaseEmbed()
    .setTitle('🌅 أذكار الصباح المباركة')
    .setDescription(`**«أَلا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»**\nالتاريخ الهجري: **${getFormattedHijriDate()}**\n\nإليك باقة من أذكار الصباح الصحيحة:`);

  azkarList.slice(0, 5).forEach((item, idx) => {
    embed.addFields({
      name: `${idx + 1}. (التكرار: ${item.count} مرة)`,
      value: `> *${item.text}*\n📖 **الفضل:** ${item.reward}`,
      inline: false
    });
  });

  return embed;
};

/**
 * إمبيد أذكار المساء
 */
const buildEveningAzkarEmbed = (azkarList) => {
  const embed = createBaseEmbed()
    .setTitle('🌙 أذكار المساء المباركة')
    .setDescription(`**«وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا»**\nالتاريخ الهجري: **${getFormattedHijriDate()}**\n\nإليك باقة من أذكار المساء الصحيحة:`);

  azkarList.slice(0, 5).forEach((item, idx) => {
    embed.addFields({
      name: `${idx + 1}. (التكرار: ${item.count} مرة)`,
      value: `> *${item.text}*\n📖 **الفضل:** ${item.reward}`,
      inline: false
    });
  });

  return embed;
};

/**
 * إمبيد الذكر العشوائي
 */
const buildRandomDhikrEmbed = (dhikrItem) => {
  return createBaseEmbed()
    .setTitle('🌿 ذكر من السنة النبوية')
    .setDescription(`> **"${dhikrItem.text}"**`)
    .addFields(
      { name: '✨ أجر وفضل الذكر', value: dhikrItem.reward, inline: false },
      { name: '📅 التاريخ الهجري', value: `\`${getFormattedHijriDate()}\``, inline: true }
    );
};

/**
 * إمبيد الآيات القرآنية والتذكير كل 5 دقائق
 */
const buildQuranEmbed = (quranItem) => {
  return createBaseEmbed()
    .setTitle('📖 آية قرآنية تذكرة كل 5 دقائق')
    .setDescription(`> **« ${quranItem.verse} »**`)
    .addFields(
      { name: '📖 السورة والآية', value: `**${quranItem.surah}** (الآية ${quranItem.ayah})`, inline: true },
      { name: '📅 التاريخ الهجري', value: `\`${getFormattedHijriDate()}\``, inline: true }
    );
};

/**
 * إمبيد الملخص الإسلامي الشامل لليوم (/today)
 */
const buildTodaySummaryEmbed = (timings, nextDetails, hadithItem) => {
  return createBaseEmbed()
    .setTitle('🌟 الملخص الإسلامي الشامل لليوم')
    .setDescription(`> 📅 **التاريخ الهجري:** ${getFormattedHijriDate()}\n> 🗓️ **التاريخ الميلادي:** ${getFormattedGregorianDate()}`)
    .addFields(
      { 
        name: '🕋 مواقيت الصلاة اليوم', 
        value: `• **الفجر:** \`${formatTime12H(timings.Fajr)}\`  |  • **الشروق:** \`${formatTime12H(timings.Sunrise)}\`
• **الظهر:** \`${formatTime12H(timings.Dhuhr)}\`  |  • **العصر:** \`${formatTime12H(timings.Asr)}\`
• **المغرب:** \`${formatTime12H(timings.Maghrib)}\` |  • **العشاء:** \`${formatTime12H(timings.Isha)}\``, 
        inline: false 
      },
      {
        name: '⏳ الصلاة القادمة',
        value: `**${nextDetails.nextPrayerName}** في تمام الساعة \`${nextDetails.time12H}\` (متبقي: \`${nextDetails.countdown}\`)`,
        inline: false
      },
      {
        name: '📖 حديث اليوم الشريف',
        value: `> *«${hadithItem.arabic}»*\n📚 **المصدر:** ${hadithItem.source}`,
        inline: false
      }
    );
};

/**
 * إمبيد التذكير بسورة الكهف والصلاة على النبي يوم الجمعة
 */
const buildFridayKahfEmbed = () => {
  return createBaseEmbed()
    .setColor(config.colors.gold)
    .setTitle('✨ نور ما بين الجمعتين — سورة الكهف والصلاة على النبي ﷺ')
    .setDescription(`> **«مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُوعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»**\n\nجمعة مباركة! لا تنسَ:\n1. 📖 قراءة **سورة الكهف**.\n2. 🌸 الإكثار من **الصلاة على النبي ﷺ**.\n3. 🤲 تحري **ساعة الاستجابة** قبل المغرب.`)
    .addFields({ name: '📅 التاريخ الهجري', value: `\`${getFormattedHijriDate()}\``, inline: true });
};

/**
 * إمبيد ساعة الاستجابة يوم الجمعة
 */
const buildFridayDuaEmbed = () => {
  return createBaseEmbed()
    .setColor(config.colors.gold)
    .setTitle('🤲 ساعة الاستجابة يوم الجمعة')
    .setDescription(`> **«فِيهَا سَاعَةٌ لا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ وَهُوَ قَائِمٌ يُصَلِّي يَسْأَلُ اللَّهَ تَعَالَى شَيْئًا إِلا أَعْطَاهُ إِيَّاهُ»**\n\nأخي المسلم / أختي المسلمة، قارب شمس الجمعة على المغيب، فاستغل هذه الأوقات المباركة بالدعاء والتضرع إلى الله.`)
    .addFields({ name: '📅 التاريخ الهجري', value: `\`${getFormattedHijriDate()}\``, inline: true });
};

module.exports = {
  createBaseEmbed,
  buildPrayerEmbed,
  buildPrayerTimesEmbed,
  buildNextPrayerEmbed,
  buildMorningAzkarEmbed,
  buildEveningAzkarEmbed,
  buildRandomDhikrEmbed,
  buildQuranEmbed,
  buildTodaySummaryEmbed,
  buildFridayKahfEmbed,
  buildFridayDuaEmbed
};
