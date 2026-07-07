/**
 * Gold Price Live API Service
 *
 * Multi-source strategy — works WITHOUT any API key:
 *
 *   Priority chain:
 *   1. GoldAPI.io (XAU/IDR)        — if API key is configured (best: single call)
 *   2. Free gold-spot + forex APIs — works out of the box, no key needed
 *   3. Cached data                 — when offline
 *   4. null                        — ultimate fallback → use default prices
 *
 * GoldAPI.io key can be set via:
 *   - Vite env var  → VITE_GOLDAPI_KEY
 *   - Admin Settings → localStorage sg_goldapi_key
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TROY_OUNCE_TO_GRAM = 31.1034768;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const CACHE_KEY_PRICES = 'sg_live_prices';
const CACHE_KEY_SPOT = 'sg_live_spot_usd';
const CACHE_KEY_FOREX = 'sg_live_usd_idr';
const CACHE_KEY_TIMESTAMP = 'sg_live_timestamp';

// ---------------------------------------------------------------------------
// Karat multipliers
// ---------------------------------------------------------------------------

const KARAT_MULTIPLIERS = {
  '24K': 1.0,
  '22K': 22 / 24,
  '18K': 18 / 24,
  '17K': 17 / 24,
  '16K': 16 / 24,
  '8K': 8 / 24,
};

const LM_ANTAM_PREMIUM = 1.04;
const LM_UBS_PREMIUM = 1.035;

const DEFAULT_BUY_MARGIN = 0.03;
const DEFAULT_SELL_MARGIN = 0.03;

// ---------------------------------------------------------------------------
// Configurable price templates — NOT hardcoded
// Add, remove, or tweak these to change what getPriceTemplates() returns
// ---------------------------------------------------------------------------

/**
 * Each template describes one row in the live-price table:
 *   kadar      — label shown in the "Kadar" column
 *   category   — grouping label (e.g. "Emas Perhiasan", "Logam Mulia")
 *   multiplier — karat fraction (24K = 1.0, 18K = 18/24, etc.)
 *   premium    — optional multiplier on top (Antam ≈ 1.04, UBS ≈ 1.035)
 */
export const PRICE_TEMPLATES = [
  { kadar: '24K',        category: 'Emas Perhiasan',  multiplier: KARAT_MULTIPLIERS['24K'] },
  { kadar: '22K',        category: 'Emas Perhiasan',  multiplier: KARAT_MULTIPLIERS['22K'] },
  { kadar: '18K',        category: 'Emas Perhiasan',  multiplier: KARAT_MULTIPLIERS['18K'] },
  { kadar: '17K',        category: 'Emas Perhiasan',  multiplier: KARAT_MULTIPLIERS['17K'] },
  { kadar: '16K',        category: 'Emas Perhiasan',  multiplier: KARAT_MULTIPLIERS['16K'] },
  { kadar: '8K',         category: 'Emas Perhiasan',  multiplier: KARAT_MULTIPLIERS['8K'] },
  { kadar: 'LM Antam',   category: 'Logam Mulia',     multiplier: KARAT_MULTIPLIERS['24K'], premium: LM_ANTAM_PREMIUM },
  { kadar: 'LM UBS',     category: 'Logam Mulia',     multiplier: KARAT_MULTIPLIERS['24K'], premium: LM_UBS_PREMIUM },
  { kadar: 'Tanpa Surat',category: 'Emas Tanpa Surat',multiplier: KARAT_MULTIPLIERS['24K'] * 0.95 },
];

/**
 * Returns a deep copy of the price templates so callers can mutate safely.
 */
export function getPriceTemplates() {
  return PRICE_TEMPLATES.map((t) => ({ ...t }));
}

// ---------------------------------------------------------------------------
// API source definitions (all free, no key required for #2)
// ---------------------------------------------------------------------------

const FREE_SPOT_ENDPOINTS = [
  {
    // metals-api fallback (free, no key)
    url: 'https://api.gold-api.com/price/XAU',
    parser: (json) => {
      if (json && typeof json.price === 'number' && json.price > 0) return json.price;
      return null;
    },
  },
  {
    // alternative free endpoint
    url: 'https://api.metals.live/v1/spot/gold',
    parser: (json) => {
      // returns [{price: number}] or {price: number}
      const item = Array.isArray(json) ? json[0] : json;
      if (item && typeof item.price === 'number' && item.price > 0) return item.price;
      return null;
    },
  },
];

const FREE_FOREX_ENDPOINTS = [
  {
    // open.er-api.com — free, no key
    url: 'https://open.er-api.com/v6/latest/USD',
    parser: (json) => {
      if (json?.rates?.IDR) return json.rates.IDR;
      return null;
    },
  },
  {
    // fawazahmed0 currency API (jsDelivr CDN) — free, no key
    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    parser: (json) => {
      if (json?.usd?.idr) return json.usd.idr;
      return null;
    },
  },
];

// ---------------------------------------------------------------------------
// API key helpers
// ---------------------------------------------------------------------------

function getApiKey() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOLDAPI_KEY) {
      return import.meta.env.VITE_GOLDAPI_KEY;
    }
  } catch { /* ignore */ }
  try {
    return localStorage.getItem('sg_goldapi_key') || null;
  } catch { return null; }
}

export function saveApiKey(key) {
  try { localStorage.setItem('sg_goldapi_key', key); } catch { /* ignore */ }
}

export function getStoredApiKey() {
  try { return localStorage.getItem('sg_goldapi_key'); } catch { return null; }
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

function readCache(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}

function writeCache(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function isCacheFresh() {
  const ts = readCache(CACHE_KEY_TIMESTAMP);
  return ts ? Date.now() - ts < CACHE_TTL_MS : false;
}

// ---------------------------------------------------------------------------
// Generic fetch helper
// ---------------------------------------------------------------------------

async function tryFetch(endpoints, label) {
  for (const ep of endpoints) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(ep.url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      const json = await res.json();
      const val = ep.parser(json);
      if (val !== null && val > 0) return val;
    } catch { /* try next */ }
  }
  console.warn(`[GoldPrice] All ${label} endpoints exhausted`);
  return null;
}

// ---------------------------------------------------------------------------
// Price builder (shared by both GoldAPI.io and free-API paths)
// ---------------------------------------------------------------------------

function buildPrices(idrPerGram24k, trend, change, margins = {}, templates = PRICE_TEMPLATES) {
  const buyM = margins.buyMargin ?? DEFAULT_BUY_MARGIN;
  const sellM = margins.sellMargin ?? DEFAULT_SELL_MARGIN;

  return templates.map((t, i) => {
    const multiplier = t.multiplier ?? 1.0;
    const premium = t.premium ?? 1.0;
    const base = idrPerGram24k * multiplier * premium;
    return {
      id: i + 1,
      kadar: t.kadar,
      category: t.category,
      buyPrice: Math.round((base * (1 - buyM)) / 1000) * 1000,
      sellPrice: Math.round((base * (1 + sellM)) / 1000) * 1000,
      trend,
      change,
    };
  });
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

/**
 * Try GoldAPI.io (XAU/IDR — single call, best quality).
 * Returns { idrPerGram, trend, change } or null.
 */
/**
 * Try GoldAPI.io (www.goldapi.io) — XAU/USD with optional API key.
 * Free tier: XAU/USD is supported. IDR conversion done via forex.
 * Returns { idrPerGram, trend, change } or null.
 */
async function tryGoldApiIo() {
  const key = getApiKey();
  if (!key) return null;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    // GoldAPI.io free tier supports XAU/USD
    const res = await fetch('https://www.goldapi.io/api/XAU/USD', {
      signal: ctrl.signal,
      headers: { 'x-access-token': key, 'Content-Type': 'application/json' },
    });
    clearTimeout(t);

    if (!res.ok) {
      console.warn(`[GoldPrice] GoldAPI.io HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    // json.price = price per troy ounce in USD
    if (!json || typeof json.price !== 'number' || json.price <= 0) return null;

    // Get USD/IDR rate
    const usdToIdr = await tryFetch(FREE_FOREX_ENDPOINTS, 'USD/IDR');
    if (!usdToIdr) return null;

    const idrPerGram = (json.price / TROY_OUNCE_TO_GRAM) * usdToIdr;
    const trend = (json.ch ?? 0) >= 0 ? 'up' : 'down';
    const chp = typeof json.chp === 'number' ? json.chp : 0;
    const change = `${chp >= 0 ? '+' : ''}${chp.toFixed(2)}%`;

    return { idrPerGram, trend, change };
  } catch (err) {
    console.warn('[GoldPrice] GoldAPI.io error:', err);
    return null;
  }
}

/**
 * Try free APIs (spot XAU/USD + USD/IDR forex — two calls).
 * Returns { idrPerGram, trend, change } or null.
 */
async function tryFreeApis() {
  const [spotUsd, usdToIdr] = await Promise.all([
    tryFetch(FREE_SPOT_ENDPOINTS, 'gold-spot'),
    tryFetch(FREE_FOREX_ENDPOINTS, 'USD/IDR'),
  ]);

  if (!spotUsd || !usdToIdr) return null;

  const idrPerGram = (spotUsd / TROY_OUNCE_TO_GRAM) * usdToIdr;
  return { idrPerGram, trend: 'up', change: '+0.0%' };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch live gold prices from the best available source.
 *
 * Always works — no API key required.
 * GoldAPI.io is tried first if a key is configured; otherwise free APIs are used.
 *
 * @returns {Promise<{prices: Array, spotIdrPerGram: number, timestamp: number, source: string} | null>}
 */
export async function fetchLivePrices(margins) {
  // 1. Fresh cache? Return immediately
  if (isCacheFresh()) {
    const cached = readCache(CACHE_KEY_PRICES);
    if (cached?.length) {
      return {
        prices: cached,
        spotIdrPerGram: cached[0]?.buyPrice ? Math.round(cached[0].buyPrice / (1 - DEFAULT_BUY_MARGIN)) : 0,
        timestamp: readCache(CACHE_KEY_TIMESTAMP),
        source: 'cache',
      };
    }
  }

  // 2. Try GoldAPI.io first (if key exists), then free APIs
  let result = await tryGoldApiIo();
  // 'live' = GoldAPI.io with key; free-api fallback also returns 'live'
  let source = result ? 'live' : null;

  if (!result) {
    result = await tryFreeApis();
    source = result ? 'live' : null;
  }

  // 3. Both failed → stale cache
  if (!result) {
    const stale = readCache(CACHE_KEY_PRICES);
    if (stale?.length) {
      return {
        prices: stale,
        spotIdrPerGram: 0,
        timestamp: readCache(CACHE_KEY_TIMESTAMP),
        source: 'stale-cache',
      };
    }
    return null;
  }

  // 4. Build & cache
  const prices = buildPrices(result.idrPerGram, result.trend, result.change, margins);
  const now = Date.now();
  writeCache(CACHE_KEY_PRICES, prices);
  writeCache(CACHE_KEY_TIMESTAMP, now);

  return {
    prices,
    spotIdrPerGram: Math.round(result.idrPerGram),
    timestamp: now,
    source,
  };
}

export function getLastFetchTimestamp() {
  return readCache(CACHE_KEY_TIMESTAMP);
}

export function clearPriceCache() {
  try {
    localStorage.removeItem(CACHE_KEY_PRICES);
    localStorage.removeItem(CACHE_KEY_SPOT);
    localStorage.removeItem(CACHE_KEY_FOREX);
    localStorage.removeItem(CACHE_KEY_TIMESTAMP);
  } catch { /* ignore */ }
}

/**
 * Test a GoldAPI.io key. Returns { price, ch, chp } or throws.
 */
export async function testApiKey(apiKey) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  const res = await fetch('https://www.goldapi.io/api/XAU/IDR', {
    signal: ctrl.signal,
    headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
  });
  clearTimeout(t);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (!json || typeof json.price !== 'number') throw new Error('Invalid response');

  return {
    price: json.price,
    ch: json.ch ?? 0,
    chp: json.chp ?? 0,
    timestamp: json.timestamp ?? Math.floor(Date.now() / 1000),
  };
}
