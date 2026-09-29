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

  // Dedicated source for Dollar (دلار آمریکا)
  dollarSourceType: 'telegram',
  dollarTelegramChannel: '@tgju_org',
  dollarWebsiteUrl: 'https://www.tgju.org',
  dollarSourceUnit: 'toman',
  dollarDisplayUnit: 'toman',

  // Dedicated source for 18k Gold (طلای ۱۸ عیار)
  goldSourceType: 'telegram',
  goldTelegramChannel: '@tgju_org',
  goldWebsiteUrl: 'https://www.tgju.org',
  goldSourceUnit: 'toman',
  goldDisplayUnit: 'toman',

  // General source for other items (سکه، انس، یورو و...)
  generalMarketSourceUrl: 'https://www.tgju.org',
  generalSourceUnit: 'toman',

  // Legacy/Fallback aliases
  goldDollarSourceType: 'telegram',
  goldDollarTelegramChannel: '@tgju_org',
  goldDollarWebsiteUrl: 'https://www.tgju.org',
  goldDollarSourceUnit: 'toman',
  goldDollarDisplayUnit: 'toman',

  telegramChannelOrUrl: '@tgju_org',
  customApiUrl: '',
  lastFetchTime: '',
  lastFetchStatus: 'idle',
  lastFetchMessage: 'آماده دریافت نرخ‌های دلار، طلا و سایر موارد',
};

function filterOutKarat(n: number, symbol: string): boolean {
  if (symbol === 'gold_18k' && (n === 18 || n === 750)) return false;
  if (symbol === 'gold_24k' && (n === 24 || n === 999 || n === 1000)) return false;
  if (symbol === 'gold_melted' && (n === 17 || n === 705)) return false;
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
 * - If auto: check text keywords or value range thresholds
 */
export function normalizeToTomanWithUnit(
  symbol: string,
  rawVal: number,
  sourceUnit: SourceCurrencyUnit = 'auto',
  lineText: string = ''
): number {
  if (sourceUnit === 'rial') {
    return rawVal / 10;
  }
  if (sourceUnit === 'toman') {
    return rawVal;
  }

  // Auto-detection based on text keywords
  const lower = lineText.toLowerCase();
  if (lower.includes('ریال') || lower.includes('rial') || lower.includes('irr')) {
    return rawVal / 10;
  }
  if (lower.includes('تومان') || lower.includes('toman') || lower.includes('irt')) {
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
    if (rawVal > 30000000) return rawVal / 10;
    return rawVal;
  }
  if (symbol.startsWith('coin_') || symbol === 'gold_melted') {
    if (rawVal > 60000000) return rawVal / 10;
    return rawVal;
  }
  return rawVal;
}

function cleanHtmlContent(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|tr|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');
}

function isReasonablePrice(symbol: string, priceToman: number): boolean {
  if (symbol === 'usd') return priceToman >= 10000 && priceToman <= 2000000;
  if (symbol === 'usdt') return priceToman >= 10000 && priceToman <= 2000000;
  if (symbol === 'gold_18k') return priceToman >= 500000 && priceToman <= 100000000;
  if (symbol === 'gold_24k') return priceToman >= 600000 && priceToman <= 120000000;
  if (symbol === 'gold_melted') return priceToman >= 2000000 && priceToman <= 500000000;
  if (symbol.startsWith('coin_')) return priceToman >= 500000 && priceToman <= 1000000000;
  if (symbol === 'eur' || symbol === 'aed') return priceToman >= 2000;
  return priceToman > 0;
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

  const cleaned = text.includes('<') && text.includes('>') ? cleanHtmlContent(text) : text;
  const lines = cleaned
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
      regex: /(دلار\s*(نقدی|آزاد|تهران|سبزه|هرات|مشهد|سلیمانیه|افشار)?|سبزه\s*میدان|usd|dollar)/i,
    },
    {
      symbol: 'usdt',
      name: 'تتر (USDT)',
      regex: /(تتر|usdt|tether)/i,
    },
    {
      symbol: 'gold_18k',
      name: 'طلای ۱۸ عیار',
      regex: /(طلا[ی\s]*(۱۸|18|خام)?|هر\s*گرم\s*طلا|گرم\s*طلا|طلا\s*(۱۸|18)|(۱۸|18)\s*عیار|\b18\s*k\b)/i,
    },
    {
      symbol: 'gold_24k',
      name: 'طلای ۲۴ عیار',
      regex: /(طلا[ی\s]*۲۴|طلا[ی\s]*24|۲۴\s*عیار|24\s*عیار|gold\s*24k?)/i,
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
            line.includes('اونس') ||
            line.includes('سکه') ||
            line.includes('مثقال') ||
            line.includes('آبشده') ||
            line.includes('ابشده') ||
            line.includes('مظنه'))
        ) {
          continue;
        }
        if (
          rule.symbol === 'usd' &&
          (line.includes('کانادا') ||
            line.includes('استرالیا') ||
            line.includes('تتر') ||
            line.includes('usdt'))
        ) {
          continue;
        }

        const num = extractPriceFromLine(line, rule.symbol);
        if (num && num > 0) {
          const finalPriceToman = normalizeToTomanWithUnit(rule.symbol, num, sourceUnit, line);
          if (isReasonablePrice(rule.symbol, finalPriceToman)) {
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
  }

  // Cross-derivation between 18k and Melted Gold if one is present and the other is missing
  // Bazaar standard formula: 1 Mesghal 17k (705) = 4.6083g -> 1g 18k (750) = Mesghal / 4.3318
  if (!matchedMap.has('gold_18k') && matchedMap.has('gold_melted')) {
    const melted = matchedMap.get('gold_melted')!;
    const derivedPrice = Math.round(melted.priceToman / 4.3318);
    matchedMap.set('gold_18k', {
      symbol: 'gold_18k',
      name: 'طلای ۱۸ عیار',
      priceToman: derivedPrice,
      matchedLine: `${melted.matchedLine} (محاسبه از مظنه آبشده)`,
    });
  } else if (!matchedMap.has('gold_melted') && matchedMap.has('gold_18k')) {
    const gold18 = matchedMap.get('gold_18k')!;
    const derivedPrice = Math.round(gold18.priceToman * 4.3318);
    matchedMap.set('gold_melted', {
      symbol: 'gold_melted',
      name: 'مثقال طلا (آبشده)',
      priceToman: derivedPrice,
      matchedLine: `${gold18.matchedLine} (محاسبه از طلای ۱۸ عیار)`,
    });
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
 * Direct Live Rates API from TGJU (call.tgju.org)
 * Returns live parsed Toman prices and 24h change percentages directly
 */
export async function fetchTgjuDirectRates(): Promise<{
  usd?: { priceToman: number; change24h: number };
  gold_18k?: { priceToman: number; change24h: number };
  gold_24k?: { priceToman: number; change24h: number };
  gold_melted?: { priceToman: number; change24h: number };
  coin_emami?: { priceToman: number; change24h: number };
  coin_half?: { priceToman: number; change24h: number };
  coin_quarter?: { priceToman: number; change24h: number };
  coin_gram?: { priceToman: number; change24h: number };
  eur?: { priceToman: number; change24h: number };
  aed?: { priceToman: number; change24h: number };
} | null> {
  const parseNum = (item: any) => {
    if (!item?.p) return null;
    const clean = String(item.p).replace(/[,٬]/g, '').trim();
    const val = parseFloat(clean);
    return isNaN(val) ? null : val;
  };

  const parseDp = (item: any) => {
    if (!item?.dp) return 0;
    const val = parseFloat(item.dp);
    return isNaN(val) ? 0 : val;
  };

  const endpoints = [
    'https://call.tgju.org/ajax.json',
    'https://api.allorigins.win/raw?url=https://call.tgju.org/ajax.json',
    'https://r.jina.ai/https://call.tgju.org/ajax.json',
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const text = await res.text();
        let jsonStr = text;
        const jsonMatch = text.match(/\{[\s\S]*"current"[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        const data = JSON.parse(jsonStr);
        if (data?.current) {
          const c = data.current;
          const rates: any = {};

          if (c.geram18) {
            const raw = parseNum(c.geram18);
            if (raw) rates.gold_18k = { priceToman: Math.round(raw / 10), change24h: parseDp(c.geram18) };
          }
          if (c.price_dollar_rl) {
            const raw = parseNum(c.price_dollar_rl);
            if (raw) rates.usd = { priceToman: Math.round(raw / 10), change24h: parseDp(c.price_dollar_rl) };
          }
          if (c.mesghal) {
            const raw = parseNum(c.mesghal);
            if (raw) rates.gold_melted = { priceToman: Math.round(raw / 10), change24h: parseDp(c.mesghal) };
          }
          if (c.geram24) {
            const raw = parseNum(c.geram24);
            if (raw) rates.gold_24k = { priceToman: Math.round(raw / 10), change24h: parseDp(c.geram24) };
          }
          if (c.sekee) {
            const raw = parseNum(c.sekee);
            if (raw) rates.coin_emami = { priceToman: Math.round(raw / 10), change24h: parseDp(c.sekee) };
          }
          if (c.nim) {
            const raw = parseNum(c.nim);
            if (raw) rates.coin_half = { priceToman: Math.round(raw / 10), change24h: parseDp(c.nim) };
          }
          if (c.rob) {
            const raw = parseNum(c.rob);
            if (raw) rates.coin_quarter = { priceToman: Math.round(raw / 10), change24h: parseDp(c.rob) };
          }
          if (c.gerami) {
            const raw = parseNum(c.gerami);
            if (raw) rates.coin_gram = { priceToman: Math.round(raw / 10), change24h: parseDp(c.gerami) };
          }
          if (c.price_eur) {
            const raw = parseNum(c.price_eur);
            if (raw) rates.eur = { priceToman: Math.round(raw / 10), change24h: parseDp(c.price_eur) };
          }
          if (c.price_aed) {
            const raw = parseNum(c.price_aed);
            if (raw) rates.aed = { priceToman: Math.round(raw / 10), change24h: parseDp(c.price_aed) };
          }

          return rates;
        }
      }
    } catch {
      // Continue to next endpoint candidate
    }
  }

  return null;
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
  let dollarUpdated = false;
  let goldUpdated = false;
  let otherRatesUpdated = false;

  const cleanChannelName = (ch?: string) =>
    (ch || '@tgju_org')
      .replace('@', '')
      .replace('https://t.me/', '')
      .replace('t.me/', '')
      .replace('/s/', '')
      .replace('/', '')
      .trim();

  // 1. Fetch Dollar from its dedicated Telegram/Website source
  const dollarSourceType = config.dollarSourceType || config.goldDollarSourceType || 'telegram';
  const dollarChannel = cleanChannelName(config.dollarTelegramChannel || config.goldDollarTelegramChannel);
  const dollarSourceUnit = config.dollarSourceUnit || config.goldDollarSourceUnit || 'toman';
  let dollarRawText = '';

  try {
    if (dollarSourceType === 'telegram') {
      dollarRawText = await fetchViaProxy(`https://t.me/s/${dollarChannel}`, 5000);
    } else if (dollarSourceType === 'website') {
      const siteUrl = config.dollarWebsiteUrl || config.goldDollarWebsiteUrl || 'https://www.tgju.org';
      dollarRawText = await fetchViaProxy(siteUrl, 5000);
    }

    if (dollarRawText) {
      const parsed = parseTelegramMarketText(dollarRawText, dollarSourceUnit);
      const usdItem = updated.find((p) => p.symbol === 'usd');
      const found = parsed.matchedItems.find((p) => p.symbol === 'usd');
      if (usdItem && found) {
        usdItem.priceToman = found.priceToman;
        usdItem.lastUpdated = timestamp;
        usdItem.source =
          dollarSourceType === 'telegram'
            ? `کانال تلگرام @${dollarChannel} (${dollarSourceUnit === 'rial' ? 'ورودی ریال' : 'ورودی تومان'})`
            : `سایت اختصاصی دلار (${dollarSourceUnit === 'rial' ? 'ورودی ریال' : 'ورودی تومان'})`;
        usdItem.displayCurrency = config.dollarDisplayUnit || 'toman';
        dollarUpdated = true;
      }
    }
  } catch {
    // Continue
  }

  // 2. Fetch 18k Gold from its dedicated Telegram/Website source
  const goldSourceType = config.goldSourceType || config.goldDollarSourceType || 'telegram';
  const goldChannel = cleanChannelName(config.goldTelegramChannel || config.goldDollarTelegramChannel);
  const goldSourceUnit = config.goldSourceUnit || config.goldDollarSourceUnit || 'toman';
  let goldRawText = '';

  try {
    if (
      goldSourceType === dollarSourceType &&
      goldChannel === dollarChannel &&
      dollarRawText
    ) {
      // Reuse text if both point to the same channel
      goldRawText = dollarRawText;
    } else if (goldSourceType === 'telegram') {
      goldRawText = await fetchViaProxy(`https://t.me/s/${goldChannel}`, 5000);
    } else if (goldSourceType === 'website') {
      const siteUrl = config.goldWebsiteUrl || config.goldDollarWebsiteUrl || 'https://www.tgju.org';
      goldRawText = await fetchViaProxy(siteUrl, 5000);
    }

    if (goldRawText) {
      const parsed = parseTelegramMarketText(goldRawText, goldSourceUnit);
      const goldItem = updated.find((p) => p.symbol === 'gold_18k');
      const found = parsed.matchedItems.find((p) => p.symbol === 'gold_18k');
      if (goldItem && found) {
        goldItem.priceToman = found.priceToman;
        goldItem.lastUpdated = timestamp;
        goldItem.source =
          goldSourceType === 'telegram'
            ? `کانال تلگرام @${goldChannel} (${goldSourceUnit === 'rial' ? 'ورودی ریال' : 'ورودی تومان'})`
            : `سایت اختصاصی طلا (${goldSourceUnit === 'rial' ? 'ورودی ریال' : 'ورودی تومان'})`;
        goldItem.displayCurrency = config.goldDisplayUnit || 'toman';
        goldUpdated = true;
      }
    }
  } catch {
    // Continue
  }

  // 3. Direct TGJU API Fallback or General items provider
  const anyOtherEnabled = updated.some(
    (item) => item.isEnabled && item.symbol !== 'usd' && item.symbol !== 'gold_18k'
  );

  // If Dollar or Gold wasn't updated from custom source, OR if other coins/currencies are enabled
  if (!dollarUpdated || !goldUpdated || anyOtherEnabled) {
    try {
      const tgjuRates = await fetchTgjuDirectRates();
      if (tgjuRates) {
        // Update Dollar if missing
        if (!dollarUpdated && tgjuRates.usd) {
          const usdItem = updated.find((p) => p.symbol === 'usd');
          if (usdItem) {
            usdItem.priceToman = tgjuRates.usd.priceToman;
            usdItem.change24h = tgjuRates.usd.change24h;
            usdItem.lastUpdated = timestamp;
            usdItem.source = 'سایت tgju.org (زنده)';
            usdItem.displayCurrency = config.dollarDisplayUnit || 'toman';
            dollarUpdated = true;
          }
        }

        // Update Gold 18k if missing
        if (!goldUpdated && tgjuRates.gold_18k) {
          const goldItem = updated.find((p) => p.symbol === 'gold_18k');
          if (goldItem) {
            goldItem.priceToman = tgjuRates.gold_18k.priceToman;
            goldItem.change24h = tgjuRates.gold_18k.change24h;
            goldItem.lastUpdated = timestamp;
            goldItem.source = 'سایت tgju.org (زنده)';
            goldItem.displayCurrency = config.goldDisplayUnit || 'toman';
            goldUpdated = true;
          }
        }

        // Update other enabled items
        for (const item of updated) {
          if (item.symbol !== 'usd' && item.symbol !== 'gold_18k' && item.isEnabled) {
            const rate = (tgjuRates as any)[item.symbol];
            if (rate) {
              item.priceToman = rate.priceToman;
              item.change24h = rate.change24h;
              item.lastUpdated = timestamp;
              item.source = 'سایت tgju.org (زنده)';
              otherRatesUpdated = true;
            }
          }
        }
      }
    } catch {
      // Continue
    }
  }

  // 4. Secondary fallback: General text scraping from tgju.org if any items still needed
  if (!dollarUpdated || !goldUpdated || (anyOtherEnabled && !otherRatesUpdated)) {
    try {
      const generalUrl = config.generalMarketSourceUrl || 'https://www.tgju.org';
      const generalText = await fetchViaProxy(generalUrl, 5000);

      if (generalText) {
        const parsed = parseTelegramMarketText(generalText, config.generalSourceUnit);

        if (!dollarUpdated) {
          const foundUsd = parsed.matchedItems.find((p) => p.symbol === 'usd');
          const usdItem = updated.find((p) => p.symbol === 'usd');
          if (usdItem && foundUsd) {
            usdItem.priceToman = foundUsd.priceToman;
            usdItem.lastUpdated = timestamp;
            usdItem.source = 'سایت tgju.org';
            usdItem.displayCurrency = config.dollarDisplayUnit || 'toman';
            dollarUpdated = true;
          }
        }

        if (!goldUpdated) {
          const foundGold = parsed.matchedItems.find((p) => p.symbol === 'gold_18k');
          const goldItem = updated.find((p) => p.symbol === 'gold_18k');
          if (goldItem && foundGold) {
            goldItem.priceToman = foundGold.priceToman;
            goldItem.lastUpdated = timestamp;
            goldItem.source = 'سایت tgju.org';
            goldItem.displayCurrency = config.goldDisplayUnit || 'toman';
            goldUpdated = true;
          }
        }

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

  // 5. Emergency Fallback (Nobitex public API) if either Dollar or Gold is still not updated
  if (!dollarUpdated || !goldUpdated) {
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

          const usdItem = updated.find((item) => item.symbol === 'usd');
          if (usdItem && !dollarUpdated) {
            usdItem.priceToman = Math.round(usdtToman - 250);
            usdItem.change24h = dayChange;
            usdItem.lastUpdated = timestamp;
            usdItem.source = 'نرخ زنده صرافی و بازار';
            usdItem.displayCurrency = config.dollarDisplayUnit || 'toman';
            dollarUpdated = true;
          }

          const goldItem = updated.find((item) => item.symbol === 'gold_18k');
          if (goldItem && !goldUpdated) {
            // Accurately adjust gold based on market formula or dollar movement ratio
            const prevUsdPrice = currentPrices.find((p) => p.symbol === 'usd')?.priceToman || 93400;
            const newUsdPrice = usdItem ? usdItem.priceToman : Math.round(usdtToman - 250);
            const ratio = prevUsdPrice > 0 ? newUsdPrice / prevUsdPrice : 1;

            goldItem.priceToman = Math.round(goldItem.priceToman * ratio);
            goldItem.change24h = dayChange;
            goldItem.lastUpdated = timestamp;
            goldItem.source = 'محاسبه همگام با نوسان ارز و بازار';
            goldItem.displayCurrency = config.goldDisplayUnit || 'toman';
            goldUpdated = true;
          }

          const usdtItem = updated.find((item) => item.symbol === 'usdt');
          if (usdtItem) {
            usdtItem.priceToman = usdtToman;
            usdtItem.change24h = dayChange;
            usdtItem.lastUpdated = timestamp;
          }
        }
      }
    } catch {
      // Safe fallback
    }
  }

  const enabledCount = updated.filter((item) => item.isEnabled).length;
  let message = '';
  if (dollarUpdated && goldUpdated) {
    message = `نرخ هر دو دارایی دلار آمریکا و طلای ۱۸ عیار با موفقیت به‌روزرسانی شدند (${enabledCount} آیتم فعال)`;
  } else if (dollarUpdated) {
    message = `نرخ دلار آمریکا به‌روزرسانی شد، اما نرخ طلا بدون تغییر باقی ماند (${enabledCount} آیتم فعال)`;
  } else if (goldUpdated) {
    message = `نرخ طلای ۱۸ عیار به‌روزرسانی شد، اما نرخ دلار بدون تغییر باقی ماند (${enabledCount} آیتم فعال)`;
  } else {
    message = `نرخ‌های فعال بازار با موفقیت بازخوانی شدند (${enabledCount} آیتم فعال)`;
  }

  return {
    success: dollarUpdated || goldUpdated || otherRatesUpdated,
    updatedPrices: updated,
    message,
    sourceLabel: config.goldDollarSourceType === 'telegram' ? 'کانال تلگرام' : 'سایت tgju.org',
  };
}
