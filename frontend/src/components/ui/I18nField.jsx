import { useState, useEffect } from 'react';

/**
 * Reusable multilingual field editor.
 *
 * mode: 'tabs' (default) — show one language at a time via tabs
 *       'columns' — show all languages side by side
 *
 * value: JSON string like '{"en":"Hello","de":"Hallo"}' or plain string
 * onChange: receives the updated JSON string
 * languages: array of lang codes, e.g. ['en', 'de']
 * type: 'text' or 'textarea'
 */
export default function I18nField({ value, onChange, languages = ['en', 'de'], type = 'text', placeholder = '', mode = 'tabs' }) {
  const [values, setValues] = useState({});
  const [activeLang, setActiveLang] = useState(languages[0]);

  useEffect(() => {
    if (!value) {
      setValues({});
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        setValues(parsed);
        return;
      }
    } catch {
      // Plain string — assign to first language
    }
    setValues({ [languages[0]]: value });
  }, [value, languages]);

  const handleChange = (lang, text) => {
    const updated = { ...values, [lang]: text };
    setValues(updated);
    onChange(JSON.stringify(updated));
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  if (mode === 'columns') {
    return (
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(languages.length, 3)}, 1fr)` }}>
        {languages.map((lang) => (
          <div key={lang}>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1 block uppercase">{lang}</span>
            {type === 'textarea' ? (
              <textarea rows={2} value={values[lang] || ''} onChange={(e) => handleChange(lang, e.target.value)} placeholder={placeholder} className={`${inputClass} resize-none`} />
            ) : (
              <input type="text" value={values[lang] || ''} onChange={(e) => handleChange(lang, e.target.value)} placeholder={placeholder} className={inputClass} />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default mode — dropdown language selector
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <select
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
          className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
          aria-label="Select language"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
          ))}
        </select>
      </div>
      {type === 'textarea' ? (
        <textarea rows={2} value={values[activeLang] || ''} onChange={(e) => handleChange(activeLang, e.target.value)} placeholder={placeholder} className={`${inputClass} resize-none`} />
      ) : (
        <input type="text" value={values[activeLang] || ''} onChange={(e) => handleChange(activeLang, e.target.value)} placeholder={placeholder} className={inputClass} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.closest('form')?.requestSubmit(); }}} />
      )}
    </div>
  );
}
