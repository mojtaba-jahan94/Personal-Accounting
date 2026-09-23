import { Currency } from '../types';

export function normalizeDigits(str: string): string {
  if (!str) return '';
  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arDigits = '٠١٢٣٤٥٦٧٨٩';
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const faIdx = faDigits.indexOf(char);
    if (faIdx !== -1) {
      out += faIdx;
      continue;
    }
    const arIdx = arDigits.indexOf(char);
    if (arIdx !== -1) {
      out += arIdx;
      continue;
    }
    out += char;
  }
  return out;
}

/**
 * Parse a user-entered amount string into a number.
 * Handles Persian/Arabic digits, thousand separators (`,` and `٬`), and whitespace.
 * Returns 0 if the input is invalid.
 */
export function parseAmount(str: string): number {
  if (!str) return 0;
  // 1. Normalize Persian/Arabic digits to English
  let normalized = normalizeDigits(str);
  // 2. Remove thousand separators and whitespace
  normalized = normalized.replace(/[,٬\s]/g, '');
  // 3. Parse
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

/**
 * Sanitize user input for amount fields.
 * Allows only digits (English/Persian/Arabic), a single decimal point, and minus sign at the start.
 * Normalizes Persian/Arabic digits to English.
 */
export function sanitizeAmountInput(str: string): string {
  if (!str) return '';
  // Normalize digits first
  let normalized = normalizeDigits(str);
  // Remove everything except digits, dot, minus, comma
  normalized = normalized.replace(/[^0-9.\-]/g, '');
  // Only allow minus at the very start
  const hasMinus = normalized.startsWith('-');
  normalized = normalized.replace(/-/g, '');
  // Only allow one decimal point
  const parts = normalized.split('.');
  if (parts.length > 2) {
    normalized = parts[0] + '.' + parts.slice(1).join('');
  }
  return (hasMinus ? '-' : '') + normalized;
}

/**
 * Format a raw numeric string with thousand separators for display in input fields.
 * Preserves the decimal part as-is (for user typing).
 */
export function formatAmountInput(str: string): string {
  if (!str) return '';
  // Sanitize first
  const sanitized = sanitizeAmountInput(str);
  if (!sanitized || sanitized === '-') return sanitized;
  
  const hasMinus = sanitized.startsWith('-');
  const abs = hasMinus ? sanitized.slice(1) : sanitized;
  
  // Split integer and decimal parts
  const dotIndex = abs.indexOf('.');
  const intPart = dotIndex >= 0 ? abs.slice(0, dotIndex) : abs;
  const decPart = dotIndex >= 0 ? abs.slice(dotIndex) : '';
  
  // Add thousand separators to integer part
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return (hasMinus ? '-' : '') + formatted + decPart;
}

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
  if (!num || isNaN(num) || num === 0) {
    return `صفر ${currency === 'toman' ? 'تومان' : 'ریال'}`;
  }
  if (num < 0) {
    return 'منفی ' + numberToWordsPersian(Math.abs(num), currency);
  }

  const actualNum = Math.floor(Math.abs(num));
  const chunks: number[] = [];
  let temp = actualNum;
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
      // For exactly 1000 to 1999, 'یک هزار' or 'هزار'
      if (scale === 'هزار' && chunk === 1 && actualNum < 2000) {
        words.push('هزار');
      } else {
        words.push(scale ? `${chunkWord} ${scale}` : chunkWord);
      }
    }
  }

  const result = words.join(' و ');
  return `${result} ${currency === 'toman' ? 'تومان' : 'ریال'}`;
}
