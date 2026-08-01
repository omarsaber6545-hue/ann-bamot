const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channel')
    .setDescription('تحديد قنوات مخصصة لكل نوع من التذكيرات في السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName('type')
        .setDescription('اختر نوع التذكير المراد تخصيص قناة له')
        .setRequired(true)
        .addChoices(
          { name: '🕋 مواقيت الصلاة والأذان (Prayer Times)', value: 'prayer' },
          { name: '📖 القرآن والأذكار كل 5 دقائق (5-Min Quran & Azkar)', value: 'azkar' },
          { name: '🌅 أذكار الصباح والمساء والجمعة (Daily Azkar & Friday)', value: 'daily' },
          { name: '📢 القناة العامة لجميع التذكيرات (All Reminders)', value: 'all' }
        )
    )
    .addChannelOption(option =>
      option.setName('target')
        .setDescription('اختر القناة النصية المستهدفة')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    ),

  async execute(interaction) {
    const featureType = interaction.options.getString('type');
    const targetChannel = interaction.options.getChannel('target');

    const success = db.setFeatureChannel(interaction.guildId, featureType, targetChannel.id);

    const featureNames = {
      prayer: '🕋 مواقيت الصلاة والأذان',
      azkar: '📖 القرآن والأذكار كل 5 دقائق',
      daily: '🌅 أذكار الصباح والمساء والجمعة',
      all: '📢 جميع التذكيرات العامة'
    };

    if (success) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('✅ تم تحديث قناة التذكير المخصصة بنجاح')
        .setDescription(`تم تخصيص قناة **${featureNames[featureType]}** لتُرسل في: ${targetChannel}`)
        .addFields(
          { name: '📌 ميزة التخصيص', value: 'يمكنك تشغيل هذا الأمر مجددًا لتخصيص قناة مختلفة لكل نوع تذكير!', inline: false }
        )
        .setFooter({ text: config.footerText });

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ content: '❌ حدث خطأ أثناء حفظ القناة في قاعدة البيانات.', flags: 64 });
    }
  }
};
