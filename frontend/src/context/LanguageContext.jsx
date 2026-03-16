import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { getSettingsCached } from '../hooks/useSettings';

// Static import of all language packs — to add a new language:
// 1. Create src/i18n/fr.json
// 2. Add it here: import fr from '../i18n/fr.json'
// 3. Add to translationPacks: { en, de, fr }
// 4. Add 'fr' to the 'languages' setting in admin
// That's it — the Navbar, admin forms, and content all adapt automatically.
import en from '../i18n/en.json';
import de from '../i18n/de.json';

const translationPacks = { en, de };

// Map language codes to locale strings for date formatting
const localeMap = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  nl: 'nl-NL',
  pl: 'pl-PL',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Available languages from the 'languages' setting (loaded async)
  const [availableLanguages, setAvailableLanguages] = useState(['en', 'de']);

  // Share the cached settings request from useSettings — avoids a second network call.
  useEffect(() => {
    let cancelled = false;
    getSettingsCached()
      .then((data) => {
        if (!cancelled && data?.languages) {
          setAvailableLanguages(data.languages.split(',').map((l) => l.trim()));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const switchLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);
  }, []);

  // Translation function with dot-notation key access
  const t = useCallback((key, fallback) => {
    const keys = key.split('.');
    let value = translationPacks[language] || translationPacks.en;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        let enValue = translationPacks.en;
        for (const ek of keys) {
          if (enValue && typeof enValue === 'object' && ek in enValue) {
            enValue = enValue[ek];
          } else {
            return fallback || key;
          }
        }
        return typeof enValue === 'string' ? enValue : fallback || key;
      }
    }
    return typeof value === 'string' ? value : fallback || key;
  }, [language]);

  // Locale-aware date formatting
  const formatDate = useCallback((dateStr, options) => {
    const locale = localeMap[language] || language;
    const opts = options || { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(locale, opts);
  }, [language]);

  const value = useMemo(
    () => ({ language, availableLanguages, switchLanguage, t, formatDate }),
    [language, availableLanguages, switchLanguage, t, formatDate]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
