import { useState, useEffect, useCallback, useRef } from 'react';
import {
  calculateKaratPricesFromSpot,
  clearPriceCache,
  fetchLivePrices,
  normalizeKaratLabel,
} from '../services/goldPriceApi';

/**
 * Hook that manages gold prices — live API first, Supabase as fallback.
 *
 * - Default: auto mode (useLive=true) — prices fetched from GoldAPI.io / free APIs.
 * - Admin can switch to manual mode → edit → save to Supabase.
 * - Manual mode persists via localStorage (`sg_use_live`).
 * - `refreshLive()` — force a fresh network fetch.
 *
 * @param {Array} _defaultPrices - Unused (for future use)
 * @param {Array} savedPrices    - User's saved manual prices from Supabase
 * @param {{ buyMargin: number, sellMargin: number }} margins - Configurable buy/sell margins
 * @returns {{ prices: Array, liveStatus: object, refreshLive: Function, useLive: boolean, setUseLive: Function }}
 */
export function useGoldPrices(_defaultPrices, savedPrices, margins = {}) {
  // Start with saved prices or empty — never show hardcoded defaults
  const [prices, setPrices] = useState(savedPrices?.length ? savedPrices : []);
  const [liveStatus, setLiveStatus] = useState({
    loading: false,
    source: null, // 'live' | 'cache' | 'stale-cache' | 'error' | null
    timestamp: null,
    error: null,
    spotIdrPerGram: null, // raw spot price before margin
  });
  const [useLive, setUseLiveState] = useState(() => {
    try {
      const val = localStorage.getItem('sg_use_live');
      // Default to true — auto-fetch live prices from GoldAPI.io
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  });

  // Keep refs to avoid stale closure issues in the fetch callback
  const useLiveRef = useRef(useLive);
  useLiveRef.current = useLive;
  const marginsRef = useRef(margins);
  marginsRef.current = margins;

  const savedPricesRef = useRef(savedPrices);
  savedPricesRef.current = savedPrices;

  // Sync savedPrices → local state only in manual mode
  useEffect(() => {
    if (!useLiveRef.current && savedPrices?.length) {
      setPrices(savedPrices);
    }
  }, [savedPrices]);

  const refreshLive = useCallback(async () => {
    setLiveStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      // Always clear cache — ensure fresh prices with latest margins
      clearPriceCache();
      const result = await fetchLivePrices(marginsRef.current);
      if (!result) {
        setLiveStatus((s) => ({
          loading: false,
          source: 'error',
          timestamp: null,
          error: 'Gagal mengambil harga live. Periksa koneksi internet Anda.',
          spotIdrPerGram: s.spotIdrPerGram,
        }));
        return;
      }

      setLiveStatus({
        loading: false,
        source: result.source,
        timestamp: result.timestamp,
        error: null,
        spotIdrPerGram: result.spotIdrPerGram,
      });

      if (useLiveRef.current) {
        // Merge custom entries from Manual mode that don't exist in API templates
        const apiKarats = new Set(result.prices.map((p) => normalizeKaratLabel(p.kadar)));
        const customEntries = (savedPricesRef.current || []).filter(
          (p) => !apiKarats.has(normalizeKaratLabel(p.kadar)),
        ).map((price) => {
          const calculated = calculateKaratPricesFromSpot(
            result.spotIdrPerGram,
            price.kadar,
            marginsRef.current,
          );
          return calculated
            ? {
                ...price,
                ...calculated,
                kadar: normalizeKaratLabel(price.kadar),
                trend: result.prices[0]?.trend ?? price.trend,
                change: result.prices[0]?.change ?? price.change,
              }
            : price;
        });
        setPrices([...result.prices, ...customEntries]);
      }
    } catch (err) {
      setLiveStatus((s) => ({
        loading: false,
        source: 'error',
        timestamp: null,
        error: err.message || 'Unknown error',
        spotIdrPerGram: s.spotIdrPerGram,
      }));
    }
  }, []);

  const setUseLive = useCallback(
    (value) => {
      setUseLiveState(value);
      try {
        localStorage.setItem('sg_use_live', String(value));
      } catch {
        // ignore
      }
      // When switching to Auto, refresh from API immediately
      if (value) {
        refreshLive();
      } else if (Array.isArray(savedPricesRef.current)) {
        // Restore the last saved Manual snapshot. Auto prices must never
        // overwrite Manual data unless the admin explicitly saves them.
        setPrices(savedPricesRef.current);
      }
    },
    [refreshLive],
  );

  // On mount: fetch live prices if not already cached
  useEffect(() => {
    if (useLiveRef.current) {
      refreshLive();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh when margins change (admin updated margin settings)
  const marginsInitialized = useRef(false);
  useEffect(() => {
    // Skip first render — already handled by mount effect above
    if (!marginsInitialized.current) {
      marginsInitialized.current = true;
      return;
    }
    if (useLiveRef.current) {
      refreshLive();
    }
  }, [margins.buyMargin, margins.sellMargin]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    prices,
    liveStatus,
    refreshLive,
    useLive,
    setUseLive,
  };
}
