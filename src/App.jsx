import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGoldPrices } from './hooks/useGoldPrices';
import { useSettings } from './hooks/useSettings';
import fallbackSettings from '../data/settings.json';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import { supabase } from './services/supabase';
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
  const { settings, saveSection } = useSettings(FALLBACK_SETTINGS);
  const { prices: savedPrices, banners, outlets, company: companyInfo } = settings;
  const setSavedPrices = useCallback((value) => saveSection('prices', value), [saveSection]);
  const setBanners = useCallback((value) => saveSection('banners', value), [saveSection]);
  const setOutlets = useCallback((value) => saveSection('outlets', value), [saveSection]);
  const setCompanyInfo = useCallback((value) => saveSection('company', value), [saveSection]);
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
  const {
    prices,
    liveStatus,
    refreshLive,
    useLive,
    setUseLive,
  } = useGoldPrices(FALLBACK_SETTINGS.prices, savedPrices);

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
              prices={prices}
              outlets={outlets}
              companyInfo={companyInfo}
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
                prices={prices}
                banners={banners}
                outlets={outlets}
                companyInfo={companyInfo}
                onSavePrices={setSavedPrices}
                onSaveBanners={setBanners}
                onSaveOutlets={setOutlets}
                onSaveCompany={setCompanyInfo}
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
