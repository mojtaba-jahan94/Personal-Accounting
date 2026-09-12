// Algorithms for Gregorian <-> Jalali conversion
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy: number;
  let days: number;
  jy += 1595;
  days = -355668 + (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  let gd = days + 1;
  return [gy, gm, gd];
}

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export const PERSIAN_WEEKDAYS = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
];

export function getTodayJalali(): string {
  const now = new Date();
  const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

export function getCurrentJalaliMonth(): string {
  const today = getTodayJalali();
  return today.substring(0, 7); // YYYY/MM
}

export function formatJalaliLong(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.replace(/-/g, '/').split('/');
  if (parts.length !== 3) return dateStr;
  const jy = parseInt(parts[0], 10);
  const jm = parseInt(parts[1], 10);
  const jd = parseInt(parts[2], 10);

  const monthName = PERSIAN_MONTHS[jm - 1] || '';
  return `${jd} ${monthName} ${jy}`;
}

export function getDaysInJalaliMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  // Leap year calculation for Jalali
  const isLeap = (((year - (year > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682) % 2816 < 682;
  return isLeap ? 30 : 29;
}

export function normalizeJalaliDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.replace(/-/g, '/').split('/');
  if (parts.length !== 3) return dateStr;
  const y = parts[0].padStart(4, '0');
  const m = parts[1].padStart(2, '0');
  const d = parts[2].padStart(2, '0');
  return `${y}/${m}/${d}`;
}

export function getJalaliDaysAgo(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() - days);
  const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

export function getJalaliThisMonthRange(): { start: string; end: string } {
  const now = new Date();
  const [jy, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const daysInMonth = getDaysInJalaliMonth(jy, jm);
  const start = `${jy}/${String(jm).padStart(2, '0')}/01`;
  const end = `${jy}/${String(jm).padStart(2, '0')}/${String(daysInMonth).padStart(2, '0')}`;
  return { start, end };
}

export function getJalaliLastMonthRange(): { start: string; end: string } {
  const now = new Date();
  let [jy, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  jm -= 1;
  if (jm < 1) {
    jm = 12;
    jy -= 1;
  }
  const daysInMonth = getDaysInJalaliMonth(jy, jm);
  const start = `${jy}/${String(jm).padStart(2, '0')}/01`;
  const end = `${jy}/${String(jm).padStart(2, '0')}/${String(daysInMonth).padStart(2, '0')}`;
  return { start, end };
}

export function getJalaliThreeMonthsRange(): { start: string; end: string } {
  const today = getTodayJalali();
  const daysAgo = getJalaliDaysAgo(90);
  return { start: daysAgo, end: today };
}

export function getJalaliThisYearRange(): { start: string; end: string } {
  const now = new Date();
  const [jy] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const start = `${jy}/01/01`;
  const daysInLastMonth = getDaysInJalaliMonth(jy, 12);
  const end = `${jy}/12/${String(daysInLastMonth).padStart(2, '0')}`;
  return { start, end };
}

export function isDateInJalaliRange(dateStr: string, startDate?: string, endDate?: string): boolean {
  if (!dateStr) return false;
  const norm = normalizeJalaliDate(dateStr);
  if (startDate) {
    const normStart = normalizeJalaliDate(startDate);
    if (norm < normStart) return false;
  }
  if (endDate) {
    const normEnd = normalizeJalaliDate(endDate);
    if (norm > normEnd) return false;
  }
  return true;
}
