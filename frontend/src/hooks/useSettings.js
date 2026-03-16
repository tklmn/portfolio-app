import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

let settingsCache = null;
let fetchPromise = null;

// Exported so other modules (e.g. LanguageContext) can share the same in-flight
// request and cached result instead of firing a duplicate network request.
export function getSettingsCached() {
  if (settingsCache) return Promise.resolve(settingsCache);
  if (!fetchPromise) {
    fetchPromise = api.get('/settings').then((res) => {
      settingsCache = res.data;
      return res.data;
    }).catch((err) => {
      // Don't cache failures — allow the next caller to retry.
      fetchPromise = null;
      throw err;
    });
  }
  return fetchPromise;
}

export function useSettings() {
  const [settings, setSettings] = useState(settingsCache);
  const [loading, setLoading] = useState(!settingsCache);
  const { language } = useLanguage();

  useEffect(() => {
    if (settingsCache) {
      setSettings(settingsCache);
      setLoading(false);
      return;
    }
    getSettingsCached()
      .then((data) => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    settingsCache = null;
    fetchPromise = null;
    getSettingsCached()
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  // Translate a setting key: tries key_<lang> first, falls back to base key.
  const ts = useCallback((key) => {
    if (!settings) return '';
    return settings[`${key}_${language}`] || settings[key] || '';
  }, [settings, language]);

  return { settings, loading, refresh, ts };
}
