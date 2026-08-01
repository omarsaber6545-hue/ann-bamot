const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('عرض إعدادات وتخصيص قنوات السيرفر (Multi-Channel Setup & Config)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const settings = db.getGuildSettings(interaction.guildId);

    const prayerChan = settings.prayer_channel_id ? `<#${settings.prayer_channel_id}>` : (settings.channel_id ? `<#${settings.channel_id}>` : '❌ غير محددة');
    const azkarChan = settings.azkar_channel_id ? `<#${settings.azkar_channel_id}>` : (settings.channel_id ? `<#${settings.channel_id}>` : '❌ غير محددة');
    const dailyChan = settings.daily_channel_id ? `<#${settings.daily_channel_id}>` : (settings.channel_id ? `<#${settings.channel_id}>` : '❌ غير محددة');
    const defaultChan = settings.channel_id ? `<#${settings.channel_id}>` : 'غير محددة';

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('⚙️ لوحة إعدادات وتخصيص قنوات السيرفر')
      .setDescription('تم تفعيل نظام **تخصيص قنوات متعددة (Multi-Channel Routing)** لكل ميزة بالسيرفر:')
      .addFields(
        { name: '🕋 قناة أوقات الصلاة', value: prayerChan, inline: true },
        { name: '📖 قناة القرآن والأذكار (5 دقائق)', value: azkarChan, inline: true },
        { name: '🌅 قناة أذكار الصباح والمساء والجمعة', value: dailyChan, inline: true },
        { name: '📢 القناة العامة (Fallback)', value: defaultChan, inline: true },
        { name: '🔔 حالة التذكيرات الآلية', value: settings.enabled ? '✅ مفعلة' : '❌ معطلة', inline: true },
        { name: '🏷️ رتبة المنشن عند الأذان', value: settings.role_id ? `<@&${settings.role_id}>` : 'غير محددة', inline: true }
      )
      .setFooter({ text: config.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};
