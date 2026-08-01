const { SlashCommandBuilder } = require('discord.js');
const { getPrayerTimes } = require('../services/aladhanService');
const { getNextPrayerDetails } = require('../utils/dateUtils');
const { buildNextPrayerEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nextprayer')
    .setDescription('عرض الصلاة القادمة والوقت المتبقي عليها بالعد التنازلي'),

  async execute(interaction) {
    await interaction.deferReply();
    const timings = await getPrayerTimes();

    if (!timings) {
      return interaction.editReply('❌ تعذر جلب مواقيت الصلاة حاليًا.');
    }

    const nextDetails = getNextPrayerDetails(timings);
    const embed = buildNextPrayerEmbed(nextDetails);

    await interaction.editReply({ embeds: [embed] });
  }
};
