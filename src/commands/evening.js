const { SlashCommandBuilder } = require('discord.js');
const { eveningAzkar } = require('../assets/azkarData');
const { buildEveningAzkarEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('evening')
    .setDescription('عرض وقراءة أذكار المساء المباركة'),

  async execute(interaction) {
    const embed = buildEveningAzkarEmbed(eveningAzkar);
    await interaction.reply({ embeds: [embed] });
  }
};
