const moment = require('moment-timezone');

const getTimestamp = () => {
  return moment().tz('Africa/Cairo').format('YYYY-MM-DD HH:mm:ss');
};

class Logger {
  static info(message) {
    console.log(`[${getTimestamp()}] 🟢 [INFO] ${message}`);
  }

  static warn(message) {
    console.warn(`[${getTimestamp()}] 🟡 [WARN] ${message}`);
  }

  static error(message, err = null) {
    console.error(`[${getTimestamp()}] 🔴 [ERROR] ${message}`);
    if (err) {
      console.error(err.stack || err);
    }
  }

  static debug(message) {
    if (process.env.DEBUG === 'true') {
      console.log(`[${getTimestamp()}] 🔍 [DEBUG] ${message}`);
    }
  }
}

module.exports = Logger;
