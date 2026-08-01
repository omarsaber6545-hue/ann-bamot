const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../config/config');
const Logger = require('../utils/logger');

module.exports = async (client) => {
  client.commands = new Map();
  const commandsArray = [];
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      commandsArray.push(command.data.toJSON());
      Logger.info(`Loaded slash command: /${command.data.name}`);
    }
  }

  // تسجيل أوامر الـ Slash على ديسكورد
  if (config.token && config.clientId) {
    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
      Logger.info(`Started refreshing ${commandsArray.length} application (/) commands.`);

      if (config.guildId) {
        // Fast Guild registration for testing
        await rest.put(
          Routes.applicationGuildCommands(config.clientId, config.guildId),
          { body: commandsArray }
        );
        Logger.info(`Successfully registered commands for guild: ${config.guildId}`);
      } else {
        // Global registration
        await rest.put(
          Routes.applicationCommands(config.clientId),
          { body: commandsArray }
        );
        Logger.info('Successfully registered global application (/) commands.');
      }
    } catch (err) {
      Logger.error('Failed to register application slash commands:', err);
    }
  } else {
    Logger.warn('DISCORD_TOKEN or CLIENT_ID missing in config. Slash commands registration skipped.');
  }
};
