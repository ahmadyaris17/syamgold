import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLivePrices } from '../services/goldPriceApi';

/**
 * Hook that manages gold prices with automatic live-price fetching.
 *
 * - Starts empty — never shows hardcoded default prices.
 * - On mount: fetches live prices from API (cache-first, network-second).
 * - `refreshLive()` — force a fresh network fetch.
 * - `useLive` toggle in localStorage (`sg_use_live`) controls auto mode.
 *
 * @param {Array} _defaultPrices - Unused (for future use)
 * @param {Array} savedPrices    - User's saved prices from localStorage
 * @param {Function} setSavedPrices - Setter for manual prices
 * @returns {{ prices: Array, liveStatus: object, refreshLive: Function, useLive: boolean, setUseLive: Function }}
 */
export function useGoldPrices(_defaultPrices, savedPrices, setSavedPrices) {
  // Start with saved prices or empty — never show hardcoded defaults
  const [prices, setPrices] = useState(savedPrices?.length ? savedPrices : []);
  const [liveStatus, setLiveStatus] = useState({
    loading: false,
    source: null, // 'live' | 'cache' | 'stale-cache' | 'error' | null
    timestamp: null,
    error: null,
  });
  const [useLive, setUseLiveState] = useState(() => {
    try {
      const val = localStorage.getItem('sg_use_live');
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  });

  // Keep a ref to avoid stale closure issues in the fetch callback
  const useLiveRef = useRef(useLive);
  useLiveRef.current = useLive;

  const setUseLive = useCallback(
    (value) => {
      setUseLiveState(value);
      try {
        localStorage.setItem('sg_use_live', String(value));
      } catch {
        // ignore
      }
    },
    [],
  );

  // Sync savedPrices → local state only in manual mode
  useEffect(() => {
    if (!useLiveRef.current && savedPrices?.length) {
      setPrices(savedPrices);
    }
  }, [savedPrices]);

  const refreshLive = useCallback(async () => {
    setLiveStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await fetchLivePrices();
      if (!result) {
        setLiveStatus({
          loading: false,
          source: 'error',
          timestamp: null,
          error: 'Gagal mengambil harga live. Periksa koneksi internet Anda.',
        });
        return;
      }

      setLiveStatus({
        loading: false,
        source: result.source,
        timestamp: result.timestamp,
        error: null,
      });

      if (useLiveRef.current) {
        setPrices(result.prices);
        // Also persist live prices as the "saved" prices so admin sees them
        setSavedPrices(result.prices);
      }
    } catch (err) {
      setLiveStatus({
        loading: false,
        source: 'error',
        timestamp: null,
        error: err.message || 'Unknown error',
      });
    }
  }, [setSavedPrices]);

  // On mount: fetch live prices if not already cached
  useEffect(() => {
    if (useLiveRef.current) {
      refreshLive();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    prices,
    liveStatus,
    refreshLive,
    useLive,
    setUseLive,
  };
}
