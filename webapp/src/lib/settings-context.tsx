'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, getSiteSettings } from './settings';
import { hexToRgbChannels } from './utils';
import type { SiteSettings } from './types';

const SettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    getSiteSettings()
      .then((s) => !cancelled && setSettings(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', hexToRgbChannels(settings.colors.primary));
    root.style.setProperty('--color-primary-hover', hexToRgbChannels(settings.colors.primaryHover));
    root.style.setProperty('--color-primary-light', hexToRgbChannels(settings.colors.primaryLight));
    root.style.setProperty('--color-cream', hexToRgbChannels(settings.colors.cream));
    root.style.setProperty('--color-cream-alt', hexToRgbChannels(settings.colors.creamAlt));
    root.style.setProperty('--color-ink', hexToRgbChannels(settings.colors.ink));
    root.style.setProperty('--color-muted', hexToRgbChannels(settings.colors.muted));
    root.style.setProperty('--color-border', hexToRgbChannels(settings.colors.border));
  }, [settings.colors]);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  return useContext(SettingsContext);
}
