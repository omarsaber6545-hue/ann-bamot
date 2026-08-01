const axios = require('axios');
const moment = require('moment-timezone');
const config = require('../config/config');
const Logger = require('../utils/logger');

let cache = {
  date: null,
  timings: null
};

/**
 * جلب مواقيت الصلاة لمدينة القاهرة (أو المدينة المحددة)
 */
const getPrayerTimes = async (city = config.defaultCity, country = config.defaultCountry) => {
  const todayStr = moment().tz('Africa/Cairo').format('YYYY-MM-DD');

  // استخدام التخزين المؤقت إذا كان لليوم الحالي
  if (cache.date === todayStr && cache.timings) {
    return cache.timings;
  }

  try {
    const url = `${config.aladhanApiUrl}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=5`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data && response.data.code === 200 && response.data.data) {
      const timings = response.data.data.timings;
      cache.date = todayStr;
      cache.timings = timings;
      Logger.info(`Successfully fetched prayer timings for ${city}, ${country} (${todayStr}).`);
      return timings;
    } else {
      throw new Error('Invalid API response format.');
    }
  } catch (err) {
    Logger.error(`Error fetching prayer times from API for ${city}:`, err);
    // إذا كان هناك بيانات سابقة مخزنة، ارجع بها للتفادي
    if (cache.timings) {
      Logger.warn('Returning cached timings due to API failure.');
      return cache.timings;
    }
    return null;
  }
};

module.exports = {
  getPrayerTimes
};
