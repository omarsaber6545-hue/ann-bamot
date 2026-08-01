const { SlashCommandBuilder } = require('discord.js');
const { morningAzkar } = require('../assets/azkarData');
const { buildMorningAzkarEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('morning')
    .setDescription('عرض وقراءة أذكار الصباح المباركة'),

  async execute(interaction) {
    const embed = buildMorningAzkarEmbed(morningAzkar);
    await interaction.reply({ embeds: [embed] });
  }
};
