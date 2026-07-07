import { useCallback, useEffect, useState } from 'react';
import { fetchSettings, saveSettingsSection } from '../services/settingsApi';
import { sanitizeCompanyInfo, sanitizeOutlets } from '../utils/settings';

function sanitizeSection(section, value) {
  if (section === 'company') return sanitizeCompanyInfo(value);
  if (section === 'outlets') return sanitizeOutlets(value);
  return value;
}

export function useSettings(fallbackSettings) {
  const [settings, setSettings] = useState(fallbackSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchSettings()
      .then((storedSettings) => {
        if (!active) return;
        setSettings({
          prices: storedSettings.prices || fallbackSettings.prices,
          banners: storedSettings.banners || fallbackSettings.banners,
          outlets: sanitizeOutlets(storedSettings.outlets || fallbackSettings.outlets),
          company: sanitizeCompanyInfo(storedSettings.company || fallbackSettings.company),
        });
      })
      .catch((error) => console.error('Settings fallback used:', error))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fallbackSettings]);

  const saveSection = useCallback(async (section, value) => {
    const sanitizedValue = sanitizeSection(section, value);
    const savedValue = await saveSettingsSection(section, sanitizedValue);
    setSettings((current) => ({ ...current, [section]: savedValue }));
    return savedValue;
  }, []);

  return { settings, saveSection, isLoading };
}
