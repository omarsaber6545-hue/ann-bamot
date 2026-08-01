const Logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      Logger.warn(`No command matching /${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (err) {
      Logger.error(`Error executing command /${interaction.commandName}:`, err);
      const errorMessage = '❌ حدث خطأ غير متوقع أثناء تنفيذ هذا الأمر. تم تسجيل الخطأ للفحص.';

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, flags: 64 }).catch(() => {});
        } else {
          await interaction.reply({ content: errorMessage, flags: 64 }).catch(() => {});
        }
      } catch (e) {
        // تجاهل أخطاء انتهاء وقت التفاعل (Interaction Expired)
      }
    }
  }
};
