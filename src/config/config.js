const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null, // Optional: for fast testing in a specific guild
  
  // Default Location Settings
  defaultCity: process.env.DEFAULT_CITY || 'Cairo',
  defaultCountry: process.env.DEFAULT_COUNTRY || 'Egypt',
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'Africa/Cairo',
  
  // Embed Colors
  colors: {
    primary: 0x1E824C,   // Deep Islamic Green (#1E824C)
    gold: 0xD4AF37,      // Islamic Gold (#D4AF37)
    cyan: 0x00A86B,      // Jade Green (#00A86B)
    error: 0xE74C3C,     // Crimson Red (#E74C3C)
    info: 0x3498DB       // Sky Blue (#3498DB)
  },
  
  footerText: 'اللهم صل وسلم على نبينا محمد ﷺ',
  
  // AlAdhan API endpoint
  aladhanApiUrl: 'http://api.aladhan.com/v1/timingsByCity'
};
