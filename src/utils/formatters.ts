import { Currency } from '../types';

export function toPersianDigits(n: number | string): string {
  if (n === null || n === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(amount));
}

export function formatCurrency(amount: number, currency: Currency = 'toman', persianDigits = true): string {
  const actualAmount = currency === 'rial' ? amount * 10 : amount;
  const formatted = formatNumber(actualAmount);
  const text = `${formatted} ${currency === 'toman' ? 'تومان' : 'ریال'}`;
  return persianDigits ? toPersianDigits(text) : text;
}

export function formatCardNumber(card?: string): string {
  if (!card) return '';
  const clean = card.replace(/\D/g, '');
  const match = clean.match(/(\d{1,4})/g);
  if (!match) return card;
  return toPersianDigits(match.slice(0, 4).join(' - '));
}

// Persian numbers to words
const units = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const scales = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

function chunkToWords(num: number): string {
  let result = '';
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const u = num % 10;

  if (h > 0) {
    result += hundreds[h];
  }

  const remainder = num % 100;
  if (remainder > 0) {
    if (result.length > 0) result += ' و ';
    if (remainder >= 10 && remainder < 20) {
      result += teens[remainder - 10];
    } else {
      if (t > 0) {
        result += tens[t];
        if (u > 0) result += ' و ' + units[u];
      } else if (u > 0) {
        result += units[u];
      }
    }
  }

  return result;
}

export function numberToWordsPersian(num: number, currency: Currency = 'toman'): string {
  const actualNum = currency === 'rial' ? num * 10 : num;
  if (actualNum === 0) return `صفر ${currency === 'toman' ? 'تومان' : 'ریال'}`;
  if (actualNum < 0) return 'منفی ' + numberToWordsPersian(Math.abs(num), currency);

  const chunks: number[] = [];
  let temp = Math.floor(actualNum);
  while (temp > 0) {
    chunks.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const words: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (chunk > 0) {
      const chunkWord = chunkToWords(chunk);
      const scale = scales[i];
      words.push(scale ? `${chunkWord} ${scale}` : chunkWord);
    }
  }

  const result = words.join(' و ');
  return `${result} ${currency === 'toman' ? 'تومان' : 'ریال'}`;
}
