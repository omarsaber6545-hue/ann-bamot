const { SlashCommandBuilder } = require('discord.js');
const quranVerses = require('../assets/quranData');
const { buildQuranEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quran')
    .setDescription('إرسال آية قرآنية كريمة مأثورة للتذكرة'),

  async execute(interaction) {
    const randomIndex = Math.floor(Math.random() * quranVerses.length);
    const selectedQuran = quranVerses[randomIndex];
    const embed = buildQuranEmbed(selectedQuran);

    await interaction.reply({ embeds: [embed] });
  }
};
