const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('disable')
    .setDescription('إيقاف/تعطيل إشعارات مواقيت الصلاة والأذكار في السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const success = db.setEnabled(interaction.guildId, false);

    if (success) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('🔕 تم إيقاف التذكيرات الآلية')
        .setDescription('تم تعطيل التذكيرات مؤقتًا. يمكنك إعادة تفعيلها مجددًا باستخدام الأمر `/enable`.')
        .setFooter({ text: config.footerText });

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ content: '❌ حدث خطأ أثناء تعطيل الخدمة.', flags: 64 });
    }
  }
};
