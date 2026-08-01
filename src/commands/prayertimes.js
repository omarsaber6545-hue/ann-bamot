const { SlashCommandBuilder } = require('discord.js');
const { getPrayerTimes } = require('../services/aladhanService');
const { buildPrayerTimesEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prayertimes')
    .setDescription('عرض مواقيت الصلاة لليوم حسب توقيت القاهرة ومصر'),

  async execute(interaction) {
    await interaction.deferReply();
    const timings = await getPrayerTimes();

    if (!timings) {
      return interaction.editReply('❌ تعذر جلب مواقيت الصلاة حاليًا. يرجى المحاولة لاحقاً.');
    }

    const embed = buildPrayerTimesEmbed(timings);
    await interaction.editReply({ embeds: [embed] });
  }
};
