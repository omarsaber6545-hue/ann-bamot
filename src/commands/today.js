const { SlashCommandBuilder } = require('discord.js');
const { getPrayerTimes } = require('../services/aladhanService');
const { getNextPrayerDetails } = require('../utils/dateUtils');
const hadiths = require('../assets/hadithData');
const { buildTodaySummaryEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('today')
    .setDescription('عرض الملخص الإسلامي اليومي (التاريخ الهجري، المواقيت، الصلاة القادمة، وحديث اليوم)'),

  async execute(interaction) {
    await interaction.deferReply();
    const timings = await getPrayerTimes();

    if (!timings) {
      return interaction.editReply('❌ تعذر جلب مواقيت الصلاة حاليًا.');
    }

    const nextDetails = getNextPrayerDetails(timings);
    
    // اختيار حديث اليوم بناءً على يوم السنة لتغييره يومياً
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const todayHadith = hadiths[dayOfYear % hadiths.length];

    const embed = buildTodaySummaryEmbed(timings, nextDetails, todayHadith);
    await interaction.editReply({ embeds: [embed] });
  }
};
