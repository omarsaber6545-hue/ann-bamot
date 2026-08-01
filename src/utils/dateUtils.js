const moment = require('moment-timezone');

/**
 * الحصول على التاريخ الهجري المنسق باللغة العربية
 */
const getFormattedHijriDate = () => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('ar-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return `${formatter.format(date)} هـ`;
  } catch (err) {
    // Fallback if Intl is unavailable
    return moment().tz('Africa/Cairo').format('iDD iMMMM iYYYY') + ' هـ';
  }
};

/**
 * الحصول على التاريخ الميلادي باللغة العربية
 */
const getFormattedGregorianDate = () => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return `${formatter.format(date)} م`;
};

/**
 * تحويل وقت الصلاة بتنسيق 24 ساعة إلى تنسيق 12 ساعة باللغة العربية
 */
const formatTime12H = (time24) => {
  if (!time24) return '';
  const cleanTime = time24.split(' ')[0]; // إزالة الروابط الإضافية إن وجدت
  const [hours, minutes] = cleanTime.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const hours12 = hours % 12 || 12;
  const formattedHours = hours12 < 10 ? `0${hours12}` : hours12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

/**
 * حساب الصلاة التالية والمتبقي عليها بالعد التنازلي
 */
const getNextPrayerDetails = (timings) => {
  const now = moment().tz('Africa/Cairo');
  const prayerNames = [
    { key: 'Fajr', name: 'الفجر' },
    { key: 'Sunrise', name: 'الشروق' },
    { key: 'Dhuhr', name: 'الظهر' },
    { key: 'Asr', name: 'العصر' },
    { key: 'Maghrib', name: 'المغرب' },
    { key: 'Isha', name: 'العشاء' }
  ];

  for (const prayer of prayerNames) {
    const timeStr = timings[prayer.key].split(' ')[0];
    const [h, m] = timeStr.split(':').map(Number);
    const prayerMoment = moment().tz('Africa/Cairo').hours(h).minutes(m).seconds(0);

    if (prayerMoment.isAfter(now)) {
      const diffMs = prayerMoment.diff(now);
      const duration = moment.duration(diffMs);
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      let countdown = '';
      if (hours > 0) countdown += `${hours} ساعة و `;
      if (minutes > 0) countdown += `${minutes} دقيقة و `;
      countdown += `${seconds} ثانية`;

      return {
        nextPrayerName: prayer.name,
        time12H: formatTime12H(timeStr),
        countdown,
        hoursLeft: hours,
        minutesLeft: minutes
      };
    }
  }

  // إذا كانت جميع الصلوات اليوم قد انقضت، تكون الصلاة التالية هي فجر الغد
  const fajrStr = timings['Fajr'].split(' ')[0];
  const [h, m] = fajrStr.split(':').map(Number);
  const tomorrowFajr = moment().tz('Africa/Cairo').add(1, 'day').hours(h).minutes(m).seconds(0);
  const diffMs = tomorrowFajr.diff(now);
  const duration = moment.duration(diffMs);
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return {
    nextPrayerName: 'الفجر (غداً)',
    time12H: formatTime12H(fajrStr),
    countdown: `${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`,
    hoursLeft: hours,
    minutesLeft: minutes
  };
};

module.exports = {
  getFormattedHijriDate,
  getFormattedGregorianDate,
  formatTime12H,
  getNextPrayerDetails
};
