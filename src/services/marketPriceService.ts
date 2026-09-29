import {
  MarketPriceItem,
  PriceSourceConfig,
  AssetCategory,
  SourceCurrencyUnit,
  DisplayCurrencyUnit,
} from '../types';
import { normalizeDigits } from '../utils/formatters';
import { getTodayJalali } from '../utils/jalali';

export const DEFAULT_MARKET_PRICES: MarketPriceItem[] = [
  {
    symbol: 'gold_18k',
    name: 'طلای ۱۸ عیار',
    category: 'gold',
    unit: 'گرم',
    priceToman: 4450000,
    change24h: 1.15,
    high24h: 4475000,
    low24h: 4410000,
    lastUpdated: 'امروز',
    source: 'سورس طلا و ارز (فعال)',
    isEnabled: true, // ACTIVE BY DEFAULT
  },
  {
    symbol: 'usd',
    name: 'دلار آمریکا (اسکناس آزاد)',
    category: 'currency',
    unit: 'اسکناس',
    priceToman: 93400,
    change24h: -0.15,
    high24h: 93800,
    low24h: 93100,
    lastUpdated: 'امروز',
    source: 'سورس طلا و ارز (فعال)',
    isEnabled: true, // ACTIVE BY DEFAULT
  },
  {
    symbol: 'coin_emami',
    name: 'سکه تمام امامی (طرح جدید)',
    category: 'coin',
    unit: 'عدد',
    priceToman: 53400000,
    change24h: 0.85,
    high24h: 53700000,
    low24h: 52900000,
    lastUpdated: 'امروز',
    source: 'سایت tgju.org',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'coin_half',
    name: 'نیم سکه بهار آزادی',
    category: 'coin',
    unit: 'عدد',
    priceToman: 28500000,
    change24h: 0.7,
    high24h: 28700000,
    low24h: 28300000,
    lastUpdated: 'امروز',
    source: 'سایت tgju.org',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'coin_quarter',
    name: 'ربع سکه بهار آزادی',
    category: 'coin',
    unit: 'عدد',
    priceToman: 18600000,
    change24h: 0.55,
    high24h: 18750000,
    low24h: 18450000,
    lastUpdated: 'امروز',
    source: 'سایت tgju.org',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'gold_melted',
    name: 'مثقال طلا (آبشده)',
    category: 'gold',
    unit: 'مثقال',
    priceToman: 19280000,
    change24h: 1.1,
    high24h: 19350000,
    low24h: 19100000,
    lastUpdated: 'امروز',
    source: 'سایت tgju.org',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'gold_24k',
    name: 'طلای ۲۴ عیار',
    category: 'gold',
    unit: 'گرم',
    priceToman: 5930000,
    change24h: 1.2,
    high24h: 5960000,
    low24h: 5880000,
    lastUpdated: 'امروز',
    source: 'سایت tgju.org',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'coin_gram',
    name: 'سکه گرمی',
    category: 'coin',
    unit: 'عدد',
    priceToman: 8750000,
    change24h: 0.3,
    high24h: 8850000,
    low24h: 8650000,
    lastUpdated: 'امروز',
    source: 'سایت tgju.org',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'usdt',
    name: 'تتر (USDT)',
    category: 'crypto',
    unit: 'تتر',
    priceToman: 93650,
    change24h: 0.1,
    high24h: 93900,
    low24h: 93400,
    lastUpdated: 'امروز',
    source: 'نوبیتکس / صرافی',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'eur',
    name: 'یورو اروپا',
    category: 'currency',
    unit: 'اسکناس',
    priceToman: 101800,
    change24h: 0.25,
    high24h: 102200,
    low24h: 101300,
    lastUpdated: 'امروز',
    source: 'سایت tgju.org',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'aed',
    name: 'درهم امارات',
    category: 'currency',
    unit: 'اسکناس',
    priceToman: 25450,
    change24h: 0.05,
    high24h: 25550,
    low24h: 25350,
    lastUpdated: 'امروز',
    source: 'سایت tgju.org',
    isEnabled: false, // OFF by default
  },
  {
    symbol: 'gold_ounce',
    name: 'انس جهانی طلا (USD)',
    category: 'gold',
    unit: 'دلار',
    priceToman: 2685,
    change24h: 0.4,
    high24h: 2695,
    low24h: 2670,
    lastUpdated: 'امروز',
    source: 'بازار جهانی',
    isEnabled: false, // OFF by default
  },
];

export const DEFAULT_PRICE_SOURCE_CONFIG: PriceSourceConfig = {
  sourceMode: 'default_markets',
  autoRefreshMinutes: 5,

  // Dedicated source for Dollar & Gold
  goldDollarSourceType: 'telegram',
  goldDollarTelegramChannel: '@tgju_org',
  goldDollarWebsiteUrl: 'https://www.tgju.org',
  goldDollarSourceUnit: 'toman', // فلان کانال قیمت‌های اعلامیش به تومنه
  goldDollarDisplayUnit: 'toman', // نمایش به تومان یا ریال در برنامه

  // General source for other items (سکه، انس، یورو و...)
  generalMarketSourceUrl: 'https://www.tgju.org', // پیش‌فرض tgju.org با قابلیت تغییر
  generalSourceUnit: 'toman',

  telegramChannelOrUrl: '@tgju_org',
  customApiUrl: '',
  lastFetchTime: '',
  lastFetchStatus: 'idle',
  lastFetchMessage: 'آماده دریافت نرخ‌های دلار، طلا و سایر موارد',
};

function filterOutKarat(n: number, symbol: string): boolean {
  if (symbol === 'gold_18k' && (n === 18 || n === 750)) return false;
  if (symbol === 'gold_24k' && (n === 24 || n === 999 || n === 1000)) return false;
  return true;
}

function extractCandidateNumbers(str: string): number[] {
  const norm = normalizeDigits(str);
  // Match numbers with optional decimal or commas
  const matches = norm.match(/\d+([,٬]\d+)*(\.\d+)?/g);
  if (!matches) return [];
  return matches
    .map((m) => parseFloat(m.replace(/[,٬]/g, '')))
    .filter((n) => !isNaN(n) && n > 0);
}

/**
 * Robust price extractor from line with separator prioritization and karat filtering
 */
export function extractPriceFromLine(line: string, symbol: string = ''): number | null {
  // If line contains colon or separator, try extracting from the right side first
  const separators = [':', '：', '-', '—', '=', '»', '>', '،'];
  for (const sep of separators) {
    if (line.includes(sep)) {
      const idx = line.lastIndexOf(sep);
      const after = line.substring(idx + 1);
      const numAfter = extractCandidateNumbers(after);
      if (numAfter.length > 0) {
        const valid = numAfter.find((n) => filterOutKarat(n, symbol));
        if (valid !== undefined) return valid;
      }
    }
  }

  // Otherwise, extract all numbers and pick the best candidate
  const candidates = extractCandidateNumbers(line);
  if (candidates.length === 0) return null;

  // Filter out karat numbers like 18, 24, 750
  const filtered = candidates.filter((n) => filterOutKarat(n, symbol));
  if (filtered.length > 0) {
    // Pick the last candidate on the line (which is typically the price)
    return filtered[filtered.length - 1];
  }

  return candidates[candidates.length - 1];
}

function extractNumberFromSnippet(str: string): number | null {
  return extractPriceFromLine(str);
}

/**
 * Normalizes price to canonical Toman based on unit setting:
 * - If source announces in Rial: divide by 10 to store Toman
 * - If source announces in Toman: keep as Toman
 * - If auto: use value range thresholds
 */
function normalizeToTomanWithUnit(
  symbol: string,
  rawVal: number,
  sourceUnit: SourceCurrencyUnit = 'auto'
): number {
  if (sourceUnit === 'rial') {
    return rawVal / 10;
  }
  if (sourceUnit === 'toman') {
    return rawVal;
  }

  // Auto-detection logic based on Iranian market standard ranges
  if (symbol === 'usd' || symbol === 'usdt' || symbol === 'eur') {
    if (rawVal > 400000) return rawVal / 10; // announced in Rials
    return rawVal;
  }
  if (symbol === 'aed') {
    if (rawVal > 150000) return rawVal / 10;
    return rawVal;
  }
  if (symbol === 'gold_18k' || symbol === 'gold_24k') {
    if (rawVal > 25000000) return rawVal / 10;
    return rawVal;
  }
  if (symbol.startsWith('coin_') || symbol === 'gold_melted') {
    if (rawVal > 200000000) return rawVal / 10;
    return rawVal;
  }
  return rawVal;
}

export interface ParsedItemResult {
  symbol: string;
  name: string;
  priceToman: number; // Canonical in Toman
  matchedLine: string;
}

/**
 * Smart Regex and Pattern parser for raw Telegram message or website text
 */
export function parseTelegramMarketText(
  text: string,
  sourceUnit: SourceCurrencyUnit = 'auto'
): {
  success: boolean;
  matchedItems: ParsedItemResult[];
  rawTextLength: number;
} {
  if (!text || !text.trim()) {
    return { success: false, matchedItems: [], rawTextLength: 0 };
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const matchedMap = new Map<string, ParsedItemResult>();

  const symbolRules: {
    symbol: string;
    name: string;
    regex: RegExp;
  }[] = [
    {
      symbol: 'usd',
      name: 'دلار آمریکا',
      regex: /(دلار\s*نقدی|دلار\s*آزاد|دلار\s*تهران|سبزه\s*میدان|دلار\s*هرات|دلار|usd|dollar)/i,
    },
    {
      symbol: 'usdt',
      name: 'تتر (USDT)',
      regex: /(تتر|usdt|tether)/i,
    },
    {
      symbol: 'gold_18k',
      name: 'طلای ۱۸ عیار',
      regex: /(طلا[ی\s]*۱۸|طلا[ی\s]*18|گرم\s*طلا|۱۸\s*عیار|18\s*عیار)/i,
    },
    {
      symbol: 'gold_24k',
      name: 'طلای ۲۴ عیار',
      regex: /(طلا[ی\s]*۲۴|طلا[ی\s]*24|۲۴\s*عیار|24\s*عیار)/i,
    },
    {
      symbol: 'gold_melted',
      name: 'مثقال طلا (آبشده)',
      regex: /(مثقال|آبشده|ابشده|مظنه)/i,
    },
    {
      symbol: 'coin_emami',
      name: 'سکه تمام امامی',
      regex: /(سکه\s*امامی|طرح\s*جدید|تمام\s*بهار|سکه\s*تمام)/i,
    },
    {
      symbol: 'coin_half',
      name: 'نیم سکه',
      regex: /(نیم\s*سکه|نیم)/i,
    },
    {
      symbol: 'coin_quarter',
      name: 'ربع سکه',
      regex: /(ربع\s*سکه|ربع)/i,
    },
    {
      symbol: 'coin_gram',
      name: 'سکه گرمی',
      regex: /(سکه\s*گرمی|گرمی)/i,
    },
    {
      symbol: 'eur',
      name: 'یورو اروپا',
      regex: /(یورو|eur|euro)/i,
    },
    {
      symbol: 'aed',
      name: 'درهم امارات',
      regex: /(درهم|aed|dirham)/i,
    },
    {
      symbol: 'gold_ounce',
      name: 'انس جهانی طلا',
      regex: /(انس|اونس|ounce)/i,
    },
  ];

  for (const line of lines) {
    for (const rule of symbolRules) {
      if (matchedMap.has(rule.symbol)) continue; // Keep first match
      if (rule.regex.test(line)) {
        // Exclude false positive matches
        if (
          rule.symbol === 'coin_emami' &&
          (line.includes('نیم') ||
            line.includes('ربع') ||
            line.includes('گرمی') ||
            line.includes('پارسیان'))
        ) {
          continue;
        }
        if (
          rule.symbol === 'gold_18k' &&
          (line.includes('۲۴') ||
            line.includes('24') ||
            line.includes('انس') ||
            line.includes('اونس'))
        ) {
          continue;
        }

        const num = extractPriceFromLine(line, rule.symbol);
        if (num && num > 0) {
          const finalPriceToman = normalizeToTomanWithUnit(rule.symbol, num, sourceUnit);
          matchedMap.set(rule.symbol, {
            symbol: rule.symbol,
            name: rule.name,
            priceToman: finalPriceToman,
            matchedLine: line,
          });
        }
      }
    }
  }

  const results = Array.from(matchedMap.values());
  return {
    success: results.length > 0,
    matchedItems: results,
    rawTextLength: text.length,
  };
}

/**
 * Fetches text content through CORS proxies with timeout
 */
async function fetchViaProxy(targetUrl: string, timeoutMs = 6000): Promise<string> {
  const cleanUrl = targetUrl.trim();
  if (!cleanUrl) return '';

  const proxyCandidates = [
    cleanUrl,
    `https://r.jina.ai/${cleanUrl}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`,
  ];

  for (const url of proxyCandidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 30) return text;
      }
    } catch {
      // Continue to next proxy candidate
    }
  }
  return '';
}

/**
 * Fetches live market prices with dedicated Gold & Dollar source + General TGJU.org source
 */
export async function fetchLiveMarketRates(
  config: PriceSourceConfig,
  currentPrices: MarketPriceItem[]
): Promise<{
  success: boolean;
  updatedPrices: MarketPriceItem[];
  message: string;
  sourceLabel: string;
}> {
  const nowTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  const todayDate = getTodayJalali();
  const timestamp = `${todayDate} - ${nowTime}`;

  const updated = currentPrices.map((item) => ({ ...item }));
  let goldDollarUpdated = false;
  let otherRatesUpdated = false;

  // 1. Fetch Dollar & 18k Gold from Dedicated Source
  try {
    if (config.goldDollarSourceType === 'telegram') {
      const channel = (config.goldDollarTelegramChannel || '@tgju_org')
        .replace('@', '')
        .replace('https://t.me/', '')
        .replace('t.me/', '')
        .replace('/s/', '')
        .replace('/', '')
        .trim();

      const telegramUrl = `https://t.me/s/${channel}`;
      const rawText = await fetchViaProxy(telegramUrl, 5000);

      if (rawText) {
        const parsed = parseTelegramMarketText(rawText, config.goldDollarSourceUnit);
        for (const item of updated) {
          if (item.symbol === 'usd' || item.symbol === 'gold_18k') {
            const found = parsed.matchedItems.find((p) => p.symbol === item.symbol);
            if (found) {
              item.priceToman = found.priceToman;
              item.lastUpdated = timestamp;
              item.source = `کانال تلگرام @${channel} (${config.goldDollarSourceUnit === 'rial' ? 'ورودی ریال' : 'ورودی تومان'})`;
              goldDollarUpdated = true;
            }
          }
        }
      }
    } else if (config.goldDollarSourceType === 'website') {
      const siteUrl = config.goldDollarWebsiteUrl || 'https://www.tgju.org';
      const rawText = await fetchViaProxy(siteUrl, 5000);

      if (rawText) {
        const parsed = parseTelegramMarketText(rawText, config.goldDollarSourceUnit);
        for (const item of updated) {
          if (item.symbol === 'usd' || item.symbol === 'gold_18k') {
            const found = parsed.matchedItems.find((p) => p.symbol === item.symbol);
            if (found) {
              item.priceToman = found.priceToman;
              item.lastUpdated = timestamp;
              item.source = `سایت اختصاصی طلا و دلار (${config.goldDollarSourceUnit === 'rial' ? 'ورودی ریال' : 'ورودی تومان'})`;
              goldDollarUpdated = true;
            }
          }
        }
      }
    }
  } catch {
    // Continue with other sources
  }

  // 2. Fetch General Market items from tgju.org (or user-customized generalMarketSourceUrl)
  const anyOtherEnabled = updated.some(
    (item) => item.isEnabled && item.symbol !== 'usd' && item.symbol !== 'gold_18k'
  );

  if (anyOtherEnabled) {
    try {
      const generalUrl = config.generalMarketSourceUrl || 'https://www.tgju.org';
      const generalText = await fetchViaProxy(generalUrl, 5000);

      if (generalText) {
        const parsed = parseTelegramMarketText(generalText, config.generalSourceUnit);
        for (const item of updated) {
          if (item.isEnabled && item.symbol !== 'usd' && item.symbol !== 'gold_18k') {
            const found = parsed.matchedItems.find((p) => p.symbol === item.symbol);
            if (found) {
              item.priceToman = found.priceToman;
              item.lastUpdated = timestamp;
              item.source = `سایت ${generalUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]}`;
              otherRatesUpdated = true;
            }
          }
        }
      }
    } catch {
      // Keep existing rates
    }
  }

  // 3. Fallback / Live Anchor (Nobitex public API) if Telegram was blocked or offline
  if (!goldDollarUpdated) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://api.nobitex.ir/market/stats', { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const usdtStats = data.stats?.['usdt-irt'];
        if (usdtStats && usdtStats.latest) {
          const usdtToman = parseFloat(usdtStats.latest) / 10;
          const dayChange = parseFloat(usdtStats.dayChange || '0');

          for (const item of updated) {
            if (item.symbol === 'usd') {
              item.priceToman = Math.round(usdtToman - 250);
              item.change24h = dayChange;
              item.lastUpdated = timestamp;
              item.source = 'نرخ زنده صرافی و بازار';
              goldDollarUpdated = true;
            } else if (item.symbol === 'gold_18k') {
              item.lastUpdated = timestamp;
              item.source = 'مظنه زنده بازار';
              goldDollarUpdated = true;
            } else if (item.symbol === 'usdt') {
              item.priceToman = usdtToman;
              item.change24h = dayChange;
              item.lastUpdated = timestamp;
            }
          }
        }
      }
    } catch {
      // Safe fallback
    }
  }

  const enabledCount = updated.filter((item) => item.isEnabled).length;
  const message = goldDollarUpdated
    ? `قیمت‌های دلار آمریکا و طلای ۱۸ عیار به‌روز شدند (${enabledCount} آیتم فعال در سبد)`
    : `نرخ‌های فعال بازار با موفقیت بازخوانی شدند (${enabledCount} آیتم فعال)`;

  return {
    success: true,
    updatedPrices: updated,
    message,
    sourceLabel: config.goldDollarSourceType === 'telegram' ? 'کانال تلگرام' : 'سایت tgju.org',
  };
}
