import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGoldPrices } from './hooks/useGoldPrices';
import { useSettings } from './hooks/useSettings';
import fallbackSettings from '../data/settings.json';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import { supabase } from './services/supabase';
import { normalizeKaratLabel } from './services/goldPriceApi';
import {
  changeAdminPassword,
  signInAdmin,
  signOutAdmin,
} from './services/authApi';

const FALLBACK_SETTINGS = fallbackSettings;

function ProtectedRoute({ isAuthenticated, isLoading, children }) {
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  const { settings, saveSection, isLoading: settingsLoading } = useSettings(FALLBACK_SETTINGS);
  const { prices: savedPrices, banners, outlets, company: companyInfo, hidden_karats } = settings;
  const setSavedPrices = useCallback(async (value) => {
    // Detect karats deleted in Manual mode → auto-add to hidden list
    // so they stay hidden when switching back to Auto mode
    const oldKarats = new Set((savedPrices || []).map((p) => normalizeKaratLabel(p.kadar)));
    const newKarats = new Set((value || []).map((p) => normalizeKaratLabel(p.kadar)));
    const deletedKarats = [...oldKarats].filter((k) => !newKarats.has(k));
    const stillHidden = (hidden_karats || []).filter(
      (k) => !newKarats.has(normalizeKaratLabel(k)),
    );
    const nextHidden = [...new Set([...stillHidden, ...deletedKarats])];

    const [savedValue] = await Promise.all([
      saveSection('prices', value),
      saveSection('hidden_karats', nextHidden),
    ]);
    return savedValue;
  }, [saveSection, savedPrices, hidden_karats]);
  const setBanners = useCallback((value) => saveSection('banners', value), [saveSection]);
  const setOutlets = useCallback((value) => saveSection('outlets', value), [saveSection]);
  const setCompanyInfo = useCallback((value) => saveSection('company', value), [saveSection]);
  const setHiddenKarats = useCallback((value) => saveSection('hidden_karats', value), [saveSection]);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isAuthenticated = Boolean(session);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Live gold prices — auto-fetches from API, falls back to manual
  // Margins from Supabase company settings (or defaults)
  const margins = useMemo(() => ({
    buyMargin: (companyInfo?.buyMargin ?? 3) / 100,
    sellMargin: (companyInfo?.sellMargin ?? 3) / 100,
  }), [companyInfo?.buyMargin, companyInfo?.sellMargin]);

  const {
    prices,
    liveStatus,
    refreshLive,
    useLive,
    setUseLive,
  } = useGoldPrices(FALLBACK_SETTINGS.prices, savedPrices, margins);

  // Filter out hidden karats (admin can hide rows even in Auto mode)
  const hiddenSet = useMemo(
    () => new Set((hidden_karats || []).map(normalizeKaratLabel)),
    [hidden_karats],
  );
  const displayPrices = useMemo(
    () => (hiddenSet.size > 0
      ? prices.filter((p) => !hiddenSet.has(normalizeKaratLabel(p.kadar)))
      : prices),
    [prices, hiddenSet],
  );

  const handleLogin = async (username, password) => {
    const nextSession = await signInAdmin(username, password);
    setSession(nextSession);
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setSession(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            <Home
              banners={banners}
              prices={displayPrices}
              outlets={outlets}
              companyInfo={companyInfo}
              settingsLoading={settingsLoading}
              liveStatus={liveStatus}
              onRefresh={refreshLive}
            />
          }
        />

        {/* Admin Login */}
        <Route
          path="/admin"
          element={
            authLoading
              ? null
              : isAuthenticated
              ? <Navigate to="/admin/dashboard" replace />
              : <AdminLogin onLogin={handleLogin} />
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={authLoading}>
              <Admin
                prices={displayPrices}
                banners={banners}
                outlets={outlets}
                companyInfo={companyInfo}
                hidden_karats={hidden_karats}
                onSavePrices={setSavedPrices}
                onSaveBanners={setBanners}
                onSaveOutlets={setOutlets}
                onSaveCompany={setCompanyInfo}
                onSaveHiddenKarats={setHiddenKarats}
                onLogout={handleLogout}
                onChangePassword={changeAdminPassword}
                liveStatus={liveStatus}
                refreshLive={refreshLive}
                useLive={useLive}
                setUseLive={setUseLive}
              />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
