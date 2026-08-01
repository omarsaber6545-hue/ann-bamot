const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('عرض قائمة جميع الأوامر المتاحة وشرح استخدامها'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📖 قائمة أوامر بوت مذكر الصلاة والأذكار والقرآن')
      .setDescription('جميع الأوامر المتاحة تعمل بنظام Slash Commands (`/`):\n✨ **ملاحظة:** يقوم البوت تلقائيًا بإرسال **قرآن كريم وأذكار كل 5 دقائق** في القناة المحددة.')
      .addFields(
        { name: '⚙️ `/setup`', value: 'عرض لوحة إعدادات وتكوين السيرفر.', inline: false },
        { name: '📢 `/channel [target]`', value: 'تحديد القناة المخصصة لإرسال التذكيرات.', inline: false },
        { name: '🔔 `/enable`', value: 'تفعيل إرسال التذكيرات الآلية بالسيرفر.', inline: false },
        { name: '🔕 `/disable`', value: 'تعطيل التذكيرات الآلية بالسيرفر.', inline: false },
        { name: '🕋 `/prayertimes`', value: 'عرض مواقيت الصلاة لليوم بحسب توقيت القاهرة.', inline: false },
        { name: '⏳ `/nextprayer`', value: 'عرض الصلاة القادمة والوقت المتبقي بالعد التنازلي.', inline: false },
        { name: '📖 `/quran`', value: 'إرسال آية قرآنية كريمة مأثورة فورًا.', inline: false },
        { name: '🌿 `/azkar`', value: 'إرسال ذكر مأثور عشوائي من السنة النبوية.', inline: false },
        { name: '🌅 `/morning`', value: 'عرض وقراءة أذكار الصباح.', inline: false },
        { name: '🌙 `/evening`', value: 'عرض وقراءة أذكار المساء.', inline: false },
        { name: '🌟 `/today`', value: 'عرض الملخص الإسلامي اليومي (التاريخ، المواقيت، الحديث).', inline: false },
        { name: '❓ `/help`', value: 'عرض هذه القائمة الإرشادية.', inline: false }
      )
      .setFooter({ text: config.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
