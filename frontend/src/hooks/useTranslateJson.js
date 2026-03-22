import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Translates a JSON-encoded multilingual value.
 * Input: '{"en":"Hello","de":"Hallo"}' or plain "Hello"
 * Returns the value for the current language, falling back to 'en', then the raw string.
 */
export function useTranslateJson() {
  const { language } = useLanguage();

  const tj = useCallback((value) => {
    if (!value) return '';
    if (typeof value !== 'string') return String(value);

    // Try to parse as JSON
    if (value.startsWith('{')) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed[language] ?? parsed.en ?? parsed[Object.keys(parsed)[0]] ?? '';
        }
      } catch {
        return value;
      }
    }

    return value;
  }, [language]);

  return tj;
}
