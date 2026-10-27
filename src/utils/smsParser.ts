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

  // 2. Determine Currency Unit (Rial vs. Toman)
  let isRial = true; // Iranian bank SMS is almost always in Rials
  if (forceUnit === 'toman') {
    isRial = false;
  } else if (forceUnit === 'rial') {
    isRial = true;
  } else if (/تومان/i.test(normalized)) {
    isRial = false;
  }

  // 3. Extract Amount & attached sign (+/-)
  let amountToman = 0;
  let attachedSign: '+' | '-' | undefined = undefined;

  const amountPatterns: RegExp[] = [
    /(?:مبلغ|مبلغ\s*تراکنش|برداشت|واریز|خرید)[\s:]*([+-]?)\s*([0-9]{4,14})\s*([+-]?)\s*(?:ریال|تومان)?/i,
    /([+-]?)\s*([0-9]{4,14})\s*([+-]?)\s*(?:ریال|تومان)/i,
    /(?:مبلغ|مبلغ\s*تراکنش)[\s:]*([+-]?)\s*([0-9]{4,14})\s*([+-]?)/i,
    /([0-9]{4,14})\s*([+-])/,
    /([+-])\s*([0-9]{4,14})/,
  ];

  for (const pattern of amountPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      // Check which group has digits vs signs
      let digits = '';
      let sign: string | undefined = undefined;

      if (pattern.source.includes('([0-9]{4,14})\\s*([+-])')) {
        digits = match[1];
        sign = match[2];
      } else if (pattern.source.includes('([+-])\\s*([0-9]{4,14})')) {
        sign = match[1];
        digits = match[2];
      } else {
        const p1 = match[1];
        const p2 = match[2];
        const p3 = match[3];
        digits = p2;
        if (p1 === '+' || p3 === '+') sign = '+';
        else if (p1 === '-' || p3 === '-') sign = '-';
      }

      if (digits) {
        const rawNum = parseInt(digits, 10);
        if (!isNaN(rawNum) && rawNum > 0) {
          amountToman = isRial ? Math.round(rawNum / 10) : rawNum;
          if (sign === '+' || sign === '-') {
            attachedSign = sign;
          }
          break;
        }
      }
    }
  }

  if (amountToman === 0) {
    // Fallback: search for any standalone number between 10,000 and 1,000,000,000,000
    const fallbackNumbers = normalized.match(/\b([0-9]{4,14})\b/g);
    if (fallbackNumbers && fallbackNumbers.length > 0) {
      const candidates = fallbackNumbers
        .map(n => parseInt(n, 10))
        .filter(n => !isNaN(n) && n >= 10000 && !n.toString().startsWith('140') && !n.toString().startsWith('139'));
      if (candidates.length > 0) {
        amountToman = isRial ? Math.round(candidates[0] / 10) : candidates[0];
      }
    }
  }

  // 4. Detect Transaction Type (never return 'transfer')
  // Priority: explicit keyword -> sign attached to amount -> default to expense
  let type: TransactionType = 'expense';
  let isUncertainType = false;

  const hasIncomeKeyword = /واریز|واریزشده|واریز\s*شد|بستانکار|سود\s*سپرده|به\s*حساب\s*شما|دریافت/i.test(normalized);
  const hasExpenseKeyword = /برداشت|خرید|کسر|بدهکار|پرداخت|قبض|شارژ|از\s*حساب\s*شما|از\s*حساب/i.test(normalized);
  const hasUnambiguousExpense = /برداشت|خرید|کسر|قبض|شارژ/i.test(normalized);

  if (hasIncomeKeyword && !hasUnambiguousExpense) {
    type = 'income';
  } else if (hasExpenseKeyword && !hasIncomeKeyword) {
    type = 'expense';
  } else if (hasIncomeKeyword && hasExpenseKeyword) {
    // Both matched (e.g. "برداشت از حساب ... جهت واریز به ...")
    if (/به\s*حساب\s*شما/i.test(normalized) && !/از\s*حساب\s*شما/i.test(normalized) && !hasUnambiguousExpense) {
      type = 'income';
    } else {
      type = 'expense';
    }
  } else if (attachedSign === '+') {
    type = 'income';
  } else if (attachedSign === '-') {
    type = 'expense';
  } else {
    // Direction unclear: default to expense and flag warning
    type = 'expense';
    isUncertainType = true;
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

  // 6. Extract Balance (مانده حساب) - Supports negative balances (e.g. مانده: -2,500,000)
  let balanceToman: number | undefined;
  const balanceMatch = normalized.match(/(?:مانده|موجودی)[\s:]*([+-]?)\s*([0-9]{4,15})\s*([+-]?)\s*(?:ریال|تومان)?/i);
  if (balanceMatch && balanceMatch[2]) {
    const rawBal = parseInt(balanceMatch[2], 10);
    if (!isNaN(rawBal)) {
      const isNegative = balanceMatch[1] === '-' || balanceMatch[3] === '-';
      const signedBal = isNegative ? -rawBal : rawBal;
      balanceToman = isRial ? Math.round(signedBal / 10) : signedBal;
    }
  }

  // 7. Extract Fee (کارمزد تراکنش)
  let feeToman: number | undefined;
  const feeMatch = normalized.match(/(?:کارمزد|کارمزد\s*تراکنش|کارمزد\s*خدمات)[\s:]*([0-9]{2,10})\s*(?:ریال|تومان)?/i);
  if (feeMatch && feeMatch[1]) {
    const rawFee = parseInt(feeMatch[1], 10);
    if (!isNaN(rawFee) && rawFee > 0) {
      feeToman = isRial ? Math.round(rawFee / 10) : rawFee;
    }
  }

  // 8. Extract Date & Time (Normalized strictly to zero-padded YYYY/MM/DD)
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
  const descPrefix = type === 'income' ? 'واریز وجه' : 'خرید / برداشت';
  const description = `${descPrefix} (${bankName}${cardLast4 ? ' - کارت ' + cardLast4 : ''})`;

  return {
    bankName,
    type,
    amountToman,
    cardLast4,
    balanceToman,
    feeToman,
    isUncertainType: isUncertainType || undefined,
    date,
    time,
    description,
    rawText: rawSMS.trim(),
  };
}
