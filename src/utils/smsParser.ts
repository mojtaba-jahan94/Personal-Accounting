import { ParsedBankSMS, TransactionType } from '../types';
import { normalizeDigits } from './formatters';

export { normalizeDigits };
const KNOWN_BANKS = [
  { name: 'بلوبانک (BluBank)', patterns: [/بلو/i, /blubank/i, /بلوکارت/i] },
  { name: 'بانک ملی ایران', patterns: [/ملی/i, /ساپتا/i, /بام/i] },
  { name: 'بانک ملت', patterns: [/ملت/i] },
  { name: 'بانک سامان', patterns: [/سامان/i, /saman/i] },
  { name: 'بانک صادرات', patterns: [/صادرات/i] },
  { name: 'بانک تجارت', patterns: [/تجارت/i] },
  { name: 'بانک سپه', patterns: [/سپه/i, /انصار/i] },
  { name: 'بانک پاسارگاد', patterns: [/پاسارگاد/i, /bpi/i] },
  { name: 'بانک پارسیان', patterns: [/پارسیان/i] },
  { name: 'بانک آینده', patterns: [/آینده/i] },
  { name: 'بانک رسالت', patterns: [/رسالت/i] },
  { name: 'بانک مسکن', patterns: [/مسکن/i] },
  { name: 'بانک شهر', patterns: [/شهر/i] },
  { name: 'بانک کشاورزی', patterns: [/کشاورزی/i] },
  { name: 'بانک رفاه کارگران', patterns: [/رفاه/i] },
  { name: 'بانک قرض‌الحسنه مهر ایران', patterns: [/مهر\s*ایران/i] },
  { name: 'بانک سینا', patterns: [/سینا/i] },
  { name: 'بانک گردشگری', patterns: [/گردشگری/i] },
  { name: 'بانک خاورمیانه', patterns: [/خاورمیانه/i] },
  { name: 'بانک ایران زمین', patterns: [/ایران\s*زمین/i] },
];



export function parseBankSMS(
  rawSMS: string,
  forceUnit?: 'rial' | 'toman' | 'auto'
): ParsedBankSMS | null {
  if (!rawSMS || rawSMS.trim().length < 8) return null;

  // Run normalizeDigits first to convert all Persian/Arabic digits to English and strip separators
  const normalized = normalizeDigits(rawSMS);

  // 1. Detect Bank Name
  let bankName = 'بانک نامشخص';
  for (const b of KNOWN_BANKS) {
    if (b.patterns.some(p => p.test(normalized))) {
      bankName = b.name;
      break;
    }
  }

  // 2. Detect Transaction Type
  let type: TransactionType = 'expense';
  if (/واریز|بستانکار|سود\s*سپرده|واریزشده/i.test(normalized)) {
    type = 'income';
  } else if (/انتقال|کارت\s*به\s*کارت|حواله|پایا|ساتنا/i.test(normalized)) {
    type = 'transfer';
  } else if (/برداشت|خرید|کسر|بدهکار|پرداخت|قبض|شارژ/i.test(normalized)) {
    type = 'expense';
  }

  // 3. Determine Currency Unit (Rial vs. Toman)
  let isRial = true; // Iranian bank SMS is almost always in Rials
  if (forceUnit === 'toman') {
    isRial = false;
  } else if (forceUnit === 'rial') {
    isRial = true;
  } else if (/تومان/i.test(normalized)) {
    isRial = false;
  }

  // 4. Extract Amount
  let amountToman = 0;
  const amountPatterns = [
    /(?:مبلغ|مبلغ\s*تراکنش|برداشت|واریز|خرید)[\s:]*([0-9]{4,14})\s*(?:ریال|تومان)?/i,
    /([0-9]{4,14})\s*(?:ریال|تومان)/i,
    /(?:مبلغ|مبلغ\s*تراکنش)[\s:]*([0-9]{4,14})/i,
    /([0-9]{5,14})[\s]*[-+]/,
  ];

  for (const pattern of amountPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const rawNum = parseInt(match[1], 10);
      if (!isNaN(rawNum) && rawNum > 0) {
        amountToman = isRial ? Math.floor(rawNum / 10) : rawNum;
        break;
      }
    }
  }

  if (amountToman === 0) {
    // Fallback: search for any standalone number between 1,000 and 1,000,000,000,000
    const fallbackNumbers = normalized.match(/\b([0-9]{4,14})\b/g);
    if (fallbackNumbers && fallbackNumbers.length > 0) {
      const candidates = fallbackNumbers
        .map(n => parseInt(n, 10))
        .filter(n => !isNaN(n) && n >= 10000 && !n.toString().startsWith('140') && !n.toString().startsWith('139'));
      if (candidates.length > 0) {
        amountToman = isRial ? Math.floor(candidates[0] / 10) : candidates[0];
      }
    }
  }

  // 5. Extract Card / Account last 4 digits
  let cardLast4: string | undefined;
  const cardPatterns = [
    /(?:کارت|بلوکارت|حساب|از|به)[^\d]{0,15}[*xX]*(\d{4})\b/i,
    /[*xX]{2,}(\d{4})\b/,
    /\b(\d{4})[*xX]{2,}/,
    /(\d{16})/, // Full 16-digit card number -> extract last 4
  ];
  for (const cp of cardPatterns) {
    const cm = normalized.match(cp);
    if (cm && cm[1]) {
      cardLast4 = cm[1].length === 16 ? cm[1].slice(12) : cm[1];
      break;
    }
  }

  // 6. Extract Balance (مانده حساب)
  let balanceToman: number | undefined;
  const balanceMatch = normalized.match(/(?:مانده|موجودی)[\s:]*([0-9]{4,15})\s*(?:ریال|تومان)?/i);
  if (balanceMatch && balanceMatch[1]) {
    const rawBal = parseInt(balanceMatch[1], 10);
    if (!isNaN(rawBal)) {
      balanceToman = isRial ? Math.floor(rawBal / 10) : rawBal;
    }
  }

  // 7. Extract Date & Time (Normalized strictly to zero-padded YYYY/MM/DD)
  let date: string | undefined;
  let time: string | undefined;

  // Jalali date match: handles YYYY/MM/DD, DD/MM/YYYY, YY/MM/DD, and DD/MM/YY
  const y4FirstMatch = normalized.match(/\b(140[0-9]|139[0-9])[\/\-.](0?[1-9]|1[0-2])[\/\-.](0?[1-9]|[12][0-9]|3[01])\b/);
  const y4EndMatch = normalized.match(/\b(0?[1-9]|[12][0-9]|3[01])[\/\-.](0?[1-9]|1[0-2])[\/\-.](140[0-9]|139[0-9])\b/);

  if (y4FirstMatch) {
    date = `${y4FirstMatch[1]}/${y4FirstMatch[2].padStart(2, '0')}/${y4FirstMatch[3].padStart(2, '0')}`;
  } else if (y4EndMatch) {
    date = `${y4EndMatch[3]}/${y4EndMatch[2].padStart(2, '0')}/${y4EndMatch[1].padStart(2, '0')}`;
  } else {
    const y2Match = normalized.match(/\b([0-9]{2})[\/\-.](0?[1-9]|1[0-2])[\/\-.]([0-9]{2})\b/);
    if (y2Match) {
      const p1 = parseInt(y2Match[1], 10);
      const p3 = parseInt(y2Match[3], 10);
      if (p1 > 20 && p3 <= 20) {
        // e.g. 22/06/03 -> DD/MM/YY
        date = `14${y2Match[3].padStart(2, '0')}/${y2Match[2].padStart(2, '0')}/${y2Match[1].padStart(2, '0')}`;
      } else {
        // e.g. 03/06/22 -> YY/MM/DD
        date = `14${y2Match[1].padStart(2, '0')}/${y2Match[2].padStart(2, '0')}/${y2Match[3].padStart(2, '0')}`;
      }
    }
  }

  // Time match e.g. 14:32:05 or 14:32
  const timeMatch = normalized.match(/\b([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?\b/);
  if (timeMatch) {
    time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2].padStart(2, '0')}`;
  }

  // Description summary
  const descPrefix = type === 'expense' ? 'خرید / برداشت' : type === 'income' ? 'واریز وجه' : 'انتقال وجه';
  const description = `${descPrefix} (${bankName}${cardLast4 ? ' - کارت ' + cardLast4 : ''})`;

  return {
    bankName,
    type,
    amountToman,
    cardLast4,
    balanceToman,
    date,
    time,
    description,
    rawText: rawSMS.trim(),
  };
}
