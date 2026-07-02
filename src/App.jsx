import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGoldPrices } from './hooks/useGoldPrices';
import {
  DEFAULT_GOLD_PRICES,
  DEFAULT_BANNERS,
  DEFAULT_OUTLETS,
  COMPANY_INFO,
  ADMIN_PASSWORD,
} from './data/defaultData';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  const [savedPrices, setSavedPrices] = useLocalStorage('sg_prices', DEFAULT_GOLD_PRICES);
  const [banners, setBanners] = useLocalStorage('sg_banners', DEFAULT_BANNERS);
  const [outlets, setOutlets] = useLocalStorage('sg_outlets', DEFAULT_OUTLETS);
  const [companyInfo] = useLocalStorage('sg_company', COMPANY_INFO);
  const [adminPassword, setAdminPassword] = useLocalStorage('sg_admin_pass', ADMIN_PASSWORD);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('sg_auth') === 'true'
  );

  // Live gold prices — auto-fetches from API, falls back to manual
  const {
    prices,
    liveStatus,
    refreshLive,
    useLive,
    setUseLive,
  } = useGoldPrices(DEFAULT_GOLD_PRICES, savedPrices, setSavedPrices);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('sg_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sg_auth');
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
            isAuthenticated
              ? <Navigate to="/admin/dashboard" replace />
              : <AdminLogin onLogin={handleLogin} correctPassword={adminPassword} />
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Admin
                prices={prices}
                banners={banners}
                outlets={outlets}
                onSavePrices={setSavedPrices}
                onSaveBanners={setBanners}
                onSaveOutlets={setOutlets}
                onLogout={handleLogout}
                adminPassword={adminPassword}
                onChangePassword={setAdminPassword}
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
