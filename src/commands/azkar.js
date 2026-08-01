const { SlashCommandBuilder } = require('discord.js');
const { randomAzkar } = require('../assets/azkarData');
const { buildRandomDhikrEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('azkar')
    .setDescription('إرسال ذكر مأثور عشوائي من السنة النبوية مع فضل الأجر'),

  async execute(interaction) {
    const randomIndex = Math.floor(Math.random() * randomAzkar.length);
    const selectedDhikr = randomAzkar[randomIndex];
    const embed = buildRandomDhikrEmbed(selectedDhikr);

    await interaction.reply({ embeds: [embed] });
  }
};
