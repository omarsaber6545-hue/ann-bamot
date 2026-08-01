const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('enable')
    .setDescription('تفعيل إشعارات مواقيت الصلاة والأذكار في السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const success = db.setEnabled(interaction.guildId, true);

    if (success) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🔔 تم تفعيل التذكيرات الآلية')
        .setDescription('سيقوم البوت الآن بإرسال مواقيت الصلاة والأذكار في القناة المحددة تلقائيًا.')
        .setFooter({ text: config.footerText });

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ content: '❌ حدث خطأ أثناء تفعيل الخدمة.', flags: 64 });
    }
  }
};
