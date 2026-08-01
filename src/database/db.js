const Database = require('better-sqlite3');
const path = require('path');
const config = require('../config/config');
const Logger = require('../utils/logger');

const dbPath = path.join(__dirname, '../../database.sqlite');
let db;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  Logger.info('SQLite database connected successfully.');
} catch (err) {
  Logger.error('Failed to connect to SQLite database:', err);
  process.exit(1);
}

// Initialize and migrate database tables
const initDB = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT DEFAULT NULL,
      prayer_channel_id TEXT DEFAULT NULL,
      azkar_channel_id TEXT DEFAULT NULL,
      daily_channel_id TEXT DEFAULT NULL,
      enabled INTEGER DEFAULT 1,
      city TEXT DEFAULT '${config.defaultCity}',
      country TEXT DEFAULT '${config.defaultCountry}',
      timezone TEXT DEFAULT '${config.defaultTimezone}',
      role_id TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.exec(query);

  // Add columns dynamically if upgrading existing DB
  try {
    db.exec("ALTER TABLE guild_settings ADD COLUMN prayer_channel_id TEXT DEFAULT NULL;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE guild_settings ADD COLUMN azkar_channel_id TEXT DEFAULT NULL;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE guild_settings ADD COLUMN daily_channel_id TEXT DEFAULT NULL;");
  } catch (e) {}

  Logger.info('Database tables initialized and migrated.');
};

initDB();

module.exports = {
  getGuildSettings: (guildId) => {
    try {
      const stmt = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?');
      let row = stmt.get(guildId);
      if (!row) {
        const insert = db.prepare(`
          INSERT INTO guild_settings (guild_id, city, country, timezone)
          VALUES (?, ?, ?, ?)
        `);
        insert.run(guildId, config.defaultCity, config.defaultCountry, config.defaultTimezone);
        row = stmt.get(guildId);
      }
      return row;
    } catch (err) {
      Logger.error(`Error fetching settings for guild ${guildId}:`, err);
      return null;
    }
  },

  // Set feature channel (prayer, azkar, daily, all)
  setFeatureChannel: (guildId, feature, channelId) => {
    try {
      let column = 'channel_id';
      if (feature === 'prayer') column = 'prayer_channel_id';
      else if (feature === 'azkar') column = 'azkar_channel_id';
      else if (feature === 'daily') column = 'daily_channel_id';

      const stmt = db.prepare(`
        INSERT INTO guild_settings (guild_id, ${column}, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(guild_id) DO UPDATE SET
          ${column} = excluded.${column},
          updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(guildId, channelId);

      // إذا تم تعيين القناة العامة، وكانت القنوات الفرعية فارغة، نجعل القناة العامة كـ fallback
      return true;
    } catch (err) {
      Logger.error(`Error setting ${feature} channel for guild ${guildId}:`, err);
      return false;
    }
  },

  setEnabled: (guildId, enabled) => {
    try {
      const statusInt = enabled ? 1 : 0;
      const stmt = db.prepare(`
        INSERT INTO guild_settings (guild_id, enabled, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(guild_id) DO UPDATE SET
          enabled = excluded.enabled,
          updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(guildId, statusInt);
      return true;
    } catch (err) {
      Logger.error(`Error setting enabled status for guild ${guildId}:`, err);
      return false;
    }
  },

  setRole: (guildId, roleId) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO guild_settings (guild_id, role_id, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(guild_id) DO UPDATE SET
          role_id = excluded.role_id,
          updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(guildId, roleId);
      return true;
    } catch (err) {
      Logger.error(`Error setting role for guild ${guildId}:`, err);
      return false;
    }
  },

  getAllActiveGuilds: () => {
    try {
      const stmt = db.prepare(`
        SELECT * FROM guild_settings 
        WHERE enabled = 1 AND (channel_id IS NOT NULL OR prayer_channel_id IS NOT NULL OR azkar_channel_id IS NOT NULL OR daily_channel_id IS NOT NULL)
      `);
      return stmt.all();
    } catch (err) {
      Logger.error('Error fetching active guilds:', err);
      return [];
    }
  }
};
