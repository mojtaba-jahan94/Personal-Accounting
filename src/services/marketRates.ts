import { MarketRate, MarketSourceConfig, MarketPriceUnit } from '../types';

export const INITIAL_MARKET_RATES: MarketRate[] = [
  {
    id: 'usd',
    symbol: 'USD',
    name: 'دلار آمریکا (تهران)',
    category: 'currency',
    priceToman: 89500,
    changePercent: 0.35,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'کانال تلگرام @tahran_sabza',
  },
  {
    id: 'gold_18k',
    symbol: 'GOLD18',
    name: 'هر گرم طلای ۱۸ عیار',
    category: 'gold',
    priceToman: 4520000,
    changePercent: 0.65,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'کانال تلگرام @Narkuab',
  },
  {
    id: 'coin_emami',
    symbol: 'COIN_EMAMI',
    name: 'سکه تمام طرح جدید (امامی)',
    category: 'gold',
    priceToman: 52400000,
    changePercent: 0.8,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'سایت TGJU',
  },
  {
    id: 'coin_half',
    symbol: 'COIN_HALF',
    name: 'نیم سکه بهار آزادی',
    category: 'gold',
    priceToman: 27200000,
    changePercent: 0.5,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'سایت TGJU',
  },
  {
    id: 'coin_quarter',
    symbol: 'COIN_QUARTER',
    name: 'ربع سکه بهار آزادی',
    category: 'gold',
    priceToman: 17300000,
    changePercent: 0.25,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'سایت TGJU',
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'تتر دیجیتال (USDT)',
    category: 'crypto',
    priceToman: 89800,
    changePercent: 0.15,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'بازار ارز دیجیتال',
  },
  {
    id: 'eur',
    symbol: 'EUR',
    name: 'یورو اروپا',
    category: 'currency',
    priceToman: 96200,
    changePercent: -0.2,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'سایت TGJU',
  },
  {
    id: 'aed',
    symbol: 'AED',
    name: 'درهم امارات',
    category: 'currency',
    priceToman: 24400,
    changePercent: 0.4,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'سایت TGJU',
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'بیت‌کوین (BTC)',
    category: 'crypto',
    priceToman: 5850000000,
    changePercent: 1.45,
    unit: 'تومان',
    lastUpdated: 'امروز',
    source: 'CoinGecko / زنده',
  },
];

const STORAGE_KEY = 'pf_market_rates_v2';
const SOURCE_CONFIG_KEY = 'pf_market_source_config_v2';
const MANUAL_OVERRIDES_KEY = 'pf_market_manual_rates_v2';

export const DEFAULT_SOURCE_CONFIG: MarketSourceConfig = {
  sourceType: 'auto',
  telegramGoldChannel: 'Narkuab',
  telegramUsdChannel: 'tahran_sabza',
  lastTelegramMessageGold: '',
  lastTelegramMessageUsd: '',
  goldSourceUnit: 'auto',
  usdSourceUnit: 'auto',
  tgjuSourceUnit: 'rial',
};

export function getMarketSourceConfig(): MarketSourceConfig {
  const saved = localStorage.getItem(SOURCE_CONFIG_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_SOURCE_CONFIG, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_SOURCE_CONFIG;
    }
  }
  return DEFAULT_SOURCE_CONFIG;
}

export function saveMarketSourceConfig(config: MarketSourceConfig) {
  localStorage.setItem(SOURCE_CONFIG_KEY, JSON.stringify(config));
}

export function getManualOverrides(): Record<string, number> {
  const saved = localStorage.getItem(MANUAL_OVERRIDES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Smart Normalization of market prices into canonical Tomans.
 * Handles cases where external source quotes in Rials (e.g. 45,200,000 Rials for gold, or 895,000 for dollar)
 * or in Tomans (e.g. 4,520,000 Tomans for gold, or 89,500 for dollar).
 */
export function normalizePriceToToman(
  rawPrice: number,
  symbolId: string,
  unitPreference: MarketPriceUnit = 'auto'
): number {
  if (isNaN(rawPrice) || rawPrice <= 0) return 0;

  if (unitPreference === 'rial') {
    return Math.round(rawPrice / 10);
  }

  if (unitPreference === 'toman') {
    return Math.round(rawPrice);
  }

  // Auto-detection based on typical Iranian market thresholds
  switch (symbolId) {
    case 'gold_18k':
      // 1 gram gold is normally between 1M and 15M Tomans (10M to 150M Rials)
      return rawPrice >= 12000000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);

    case 'coin_emami':
      // Full coin is between 15M and 120M Tomans (150M to 1.2B Rials)
      return rawPrice >= 120000000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);

    case 'coin_half':
      // Half coin is between 8M and 70M Tomans (80M to 700M Rials)
      return rawPrice >= 70000000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);

    case 'coin_quarter':
      // Quarter coin is between 4M and 40M Tomans (40M to 400M Rials)
      return rawPrice >= 40000000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);

    case 'usd':
    case 'tether':
      // 1 USD is between 30k and 300k Tomans (300k to 3M Rials)
      return rawPrice >= 300000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);

    case 'eur':
      // 1 EUR is between 35k and 350k Tomans
      return rawPrice >= 350000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);

    case 'aed':
      // 1 AED is between 10k and 90k Tomans
      return rawPrice >= 90000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);

    case 'btc':
      // BTC in Tomans is normally 1B to 15B Tomans (10B to 150B Rials)
      return rawPrice >= 20000000000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);

    default:
      // General fallback threshold
      return rawPrice >= 1000000000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);
  }
}

export function setManualMarketRate(id: string, priceToman: number | null) {
  const current = getManualOverrides();
  if (priceToman === null) {
    delete current[id];
  } else {
    current[id] = priceToman;
  }
  localStorage.setItem(MANUAL_OVERRIDES_KEY, JSON.stringify(current));

  // Update cached rates immediately
  const rates = getCachedMarketRates();
  const updated = rates.map(r => {
    if (r.id === id) {
      if (priceToman !== null) {
        return {
          ...r,
          priceToman,
          isManual: true,
          source: 'ویرایش دستی شما',
          lastUpdated: 'الان',
        };
      } else {
        const initial = INITIAL_MARKET_RATES.find(item => item.id === id);
        return {
          ...r,
          priceToman: initial ? initial.priceToman : r.priceToman,
          isManual: false,
          source: initial ? initial.source : 'خودکار',
        };
      }
    }
    return r;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getCachedMarketRates(): MarketRate[] {
  const manual = getManualOverrides();
  const saved = localStorage.getItem(STORAGE_KEY);
  let rates = INITIAL_MARKET_RATES;

  if (saved) {
    try {
      rates = JSON.parse(saved);
    } catch {
      rates = INITIAL_MARKET_RATES;
    }
  }

  return rates.map(r => {
    let price = r.priceToman;
    if (manual[r.id] !== undefined) {
      price = manual[r.id];
      return {
        ...r,
        priceToman: price,
        isManual: true,
        source: 'ویرایش دستی شما',
      };
    }

    // Auto-normalize any previously cached inflated Rial numbers
    price = normalizePriceToToman(price, r.id, 'auto');

    return {
      ...r,
      priceToman: price,
    };
  });
}

// Proxy fetch helper with multi-proxy fallback
async function fetchViaProxy(targetUrl: string, timeoutMs = 8000): Promise<string | null> {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(proxyUrl, {
        headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 200) {
          return text;
        }
      }
    } catch {
      // try next proxy
    }
  }
  return null;
}

// Clean telegram channel username (strip @ or https://t.me/ or /s/)
export function sanitizeTelegramChannel(channel: string): string {
  return channel
    .trim()
    .replace(/^https?:\/\/t\.me\/(s\/)?/i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
}

// Fetch and extract messages from public Telegram channel preview
async function fetchTelegramMessages(channelName: string): Promise<string[]> {
  const clean = sanitizeTelegramChannel(channelName);
  if (!clean) return [];

  const url = `https://t.me/s/${clean}`;
  const html = await fetchViaProxy(url, 7000);
  if (!html) return [];

  const msgRegex = /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  const messages: string[] = [];
  while ((match = msgRegex.exec(html)) !== null) {
    const cleanText = match[1]
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    if (cleanText) {
      messages.push(cleanText);
    }
  }
  return messages;
}

// Parse Gold from Narkuab messages
function parseGoldFromTelegram(
  messages: string[],
  unitPref: MarketPriceUnit = 'auto'
): { priceToman: number; snippet: string } | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    // e.g. ✨ #طلا_گرمی 45,208,204 or طلا گرمی 4,520,000
    const goldMatch = msg.match(/(?:#?طلا_?گرمی|گرم\s*طلا|طلای\s*۱۸)[^\d]*([\d,]{6,10})/i);
    if (goldMatch) {
      const raw = parseInt(goldMatch[1].replace(/,/g, ''), 10);
      if (raw > 10000) {
        const priceToman = normalizePriceToToman(raw, 'gold_18k', unitPref);
        return { priceToman, snippet: msg.slice(0, 150) };
      }
    }
  }
  return null;
}

// Parse USD from tahran_sabza messages
function parseUsdFromTelegram(
  messages: string[],
  unitPref: MarketPriceUnit = 'auto'
): { priceToman: number; snippet: string } | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    // Matches: دلار فردایی تهران 89,400 or آخرین معامله : 89,200 or 895,000
    const usdMatch = msg.match(/(?:آخرین معامله|دلار فردایی|دلار نقدی|دلار تهران|دلار سبزه|دلار)[^\d]{0,30}([\d,]{5,8})/i);
    if (usdMatch) {
      const raw = parseInt(usdMatch[1].replace(/,/g, ''), 10);
      if (raw > 1000) {
        const priceToman = normalizePriceToToman(raw, 'usd', unitPref);
        return { priceToman, snippet: msg.slice(0, 150) };
      }
    }
  }
  return null;
}

// Parse TGJU HTML
function parseTgjuHtml(html: string, tgjuUnitPref: MarketPriceUnit = 'rial'): Record<string, number> {
  const result: Record<string, number> = {};

  function extractPrice(key: string, symbolId: string): number | null {
    const reg = new RegExp(`data-market-row="${key}"[\\s\\S]*?<\\/tr>`, 'i');
    const rowMatch = html.match(reg);
    if (!rowMatch) return null;

    const row = rowMatch[0];
    const dataPriceMatch = row.match(/data-price="([^"]+)"/);
    if (dataPriceMatch) {
      const raw = parseInt(dataPriceMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(raw) && raw > 0) return normalizePriceToToman(raw, symbolId, tgjuUnitPref);
    }

    const tdMatch = row.match(/<td[^>]*class="[^"]*nf[^"]*"[^>]*>([^<]+)<\/td>/);
    if (tdMatch) {
      const raw = parseInt(tdMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(raw) && raw > 0) return normalizePriceToToman(raw, symbolId, tgjuUnitPref);
    }
    return null;
  }

  const g18 = extractPrice('geram18', 'gold_18k');
  if (g18) result['gold_18k'] = g18;

  const usd = extractPrice('price_dollar_rl', 'usd');
  if (usd) result['usd'] = usd;

  const eur = extractPrice('price_eur', 'eur');
  if (eur) result['eur'] = eur;

  const aed = extractPrice('price_aed', 'aed');
  if (aed) result['aed'] = aed;

  const usdt = extractPrice('crypto-tether', 'tether');
  if (usdt) result['tether'] = usdt;

  // Coins in TGJU
  const sekebRow = html.match(/<tr[^>]*data-market-row="sekeb"[\s\S]*?<\/tr>/i);
  if (sekebRow) {
    const coinMatch = sekebRow[0].match(/(\d{1,3}(?:,\d{3}){2,})/);
    if (coinMatch) {
      const raw = parseInt(coinMatch[1].replace(/,/g, ''), 10);
      if (raw > 0) result['coin_emami'] = normalizePriceToToman(raw, 'coin_emami', tgjuUnitPref);
    }
  }

  const nimRow = html.match(/<tr[^>]*data-market-row="nim"[\s\S]*?<\/tr>/i);
  if (nimRow) {
    const nimMatch = nimRow[0].match(/(\d{1,3}(?:,\d{3}){2,})/);
    if (nimMatch) {
      const raw = parseInt(nimMatch[1].replace(/,/g, ''), 10);
      if (raw > 0) result['coin_half'] = normalizePriceToToman(raw, 'coin_half', tgjuUnitPref);
    }
  }

  const robRow = html.match(/<tr[^>]*data-market-row="rob"[\s\S]*?<\/tr>/i);
  if (robRow) {
    const robMatch = robRow[0].match(/(\d{1,3}(?:,\d{3}){2,})/);
    if (robMatch) {
      const raw = parseInt(robMatch[1].replace(/,/g, ''), 10);
      if (raw > 0) result['coin_quarter'] = normalizePriceToToman(raw, 'coin_quarter', tgjuUnitPref);
    }
  }

  return result;
}

export async function fetchLiveMarketRates(): Promise<MarketRate[]> {
  const currentRates = getCachedMarketRates();
  const config = getMarketSourceConfig();
  const manual = getManualOverrides();
  const updatedTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

  const updatedRates = [...currentRates];
  let configChanged = false;

  // 1. Fetch from Telegram channels if sourceType is 'auto' or 'telegram'
  if (config.sourceType === 'auto' || config.sourceType === 'telegram') {
    try {
      // Gold Channel (Narkuab)
      const goldMessages = await fetchTelegramMessages(config.telegramGoldChannel || 'Narkuab');
      if (goldMessages.length > 0) {
        const goldData = parseGoldFromTelegram(goldMessages, config.goldSourceUnit || 'auto');
        if (goldData) {
          config.lastTelegramMessageGold = goldData.snippet;
          configChanged = true;

          const idx = updatedRates.findIndex(r => r.id === 'gold_18k');
          if (idx !== -1 && !manual['gold_18k']) {
            const oldPrice = updatedRates[idx].priceToman;
            const change = oldPrice > 0 ? +(((goldData.priceToman - oldPrice) / oldPrice) * 100).toFixed(2) : 0;
            updatedRates[idx] = {
              ...updatedRates[idx],
              priceToman: goldData.priceToman,
              changePercent: change !== 0 ? change : updatedRates[idx].changePercent,
              lastUpdated: updatedTime,
              source: `تلگرام @${sanitizeTelegramChannel(config.telegramGoldChannel)}`,
            };
          }
        }
      }

      // USD Channel (tahran_sabza)
      const usdMessages = await fetchTelegramMessages(config.telegramUsdChannel || 'tahran_sabza');
      if (usdMessages.length > 0) {
        const usdData = parseUsdFromTelegram(usdMessages, config.usdSourceUnit || 'auto');
        if (usdData) {
          config.lastTelegramMessageUsd = usdData.snippet;
          configChanged = true;

          const idx = updatedRates.findIndex(r => r.id === 'usd');
          if (idx !== -1 && !manual['usd']) {
            const oldPrice = updatedRates[idx].priceToman;
            const change = oldPrice > 0 ? +(((usdData.priceToman - oldPrice) / oldPrice) * 100).toFixed(2) : 0;
            updatedRates[idx] = {
              ...updatedRates[idx],
              priceToman: usdData.priceToman,
              changePercent: change !== 0 ? change : updatedRates[idx].changePercent,
              lastUpdated: updatedTime,
              source: `تلگرام @${sanitizeTelegramChannel(config.telegramUsdChannel)}`,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Telegram channel fetch encountered error:', err);
    }
  }

  // 2. Fetch from TGJU if sourceType is 'auto' or 'tgju'
  if (config.sourceType === 'auto' || config.sourceType === 'tgju') {
    try {
      const tgjuHtml = await fetchViaProxy('https://www.tgju.org/', 9000);
      if (tgjuHtml) {
        const tgjuRates = parseTgjuHtml(tgjuHtml, config.tgjuSourceUnit || 'rial');
        Object.entries(tgjuRates).forEach(([id, price]) => {
          if (manual[id]) return; // respect manual override

          const idx = updatedRates.findIndex(r => r.id === id);
          if (idx !== -1) {
            // If already set by telegram with higher priority in 'auto', don't override
            if (config.sourceType === 'auto' && (id === 'gold_18k' || id === 'usd') && updatedRates[idx].source?.includes('تلگرام')) {
              return;
            }
            const oldPrice = updatedRates[idx].priceToman;
            const change = oldPrice > 0 ? +(((price - oldPrice) / oldPrice) * 100).toFixed(2) : 0;
            updatedRates[idx] = {
              ...updatedRates[idx],
              priceToman: price,
              changePercent: change !== 0 ? change : updatedRates[idx].changePercent,
              lastUpdated: updatedTime,
              source: 'سایت TGJU',
            };
          }
        });
      }
    } catch (err) {
      console.warn('TGJU fetch encountered error:', err);
    }
  }

  // 3. Fetch live Crypto BTC from CoinGecko and calculate in Toman
  try {
    const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd');
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      const btcUsd = cgData.bitcoin?.usd;
      const tetherToman = updatedRates.find(r => r.id === 'usd' || r.id === 'tether')?.priceToman || 89500;

      if (btcUsd && !manual['btc']) {
        const btcIdx = updatedRates.findIndex(r => r.id === 'btc');
        if (btcIdx !== -1) {
          updatedRates[btcIdx] = {
            ...updatedRates[btcIdx],
            priceToman: Math.round(btcUsd * tetherToman),
            lastUpdated: updatedTime,
            source: 'CoinGecko / زنده',
          };
        }
      }
    }
  } catch (err) {
    console.warn('CoinGecko fetch encountered error:', err);
  }

  // Apply manual overrides strictly and ensure normalization
  const finalRates = updatedRates.map(item => {
    let finalPrice = item.priceToman;
    if (manual[item.id] !== undefined) {
      finalPrice = manual[item.id];
      return {
        ...item,
        priceToman: finalPrice,
        isManual: true,
        source: 'ویرایش دستی شما',
      };
    }
    finalPrice = normalizePriceToToman(finalPrice, item.id, 'auto');
    return {
      ...item,
      priceToman: finalPrice,
    };
  });

  if (configChanged) {
    saveMarketSourceConfig(config);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(finalRates));
  return finalRates;
}
