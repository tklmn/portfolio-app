import { useState } from 'react';

/**
 * Tabbed language switcher for settings that use _en/_de key suffixes.
 * Reads/writes settings[key_en], settings[key_de], etc.
 */
export default function SettingsI18nField({ settingsKey, settings, onChange, languages = ['en', 'de'], type = 'text' }) {
  const [activeLang, setActiveLang] = useState(languages[0]);

  const currentKey = `${settingsKey}_${activeLang}`;
  const value = settings[currentKey] || '';

  const handleChange = (e) => {
    onChange({ ...settings, [currentKey]: e.target.value });
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

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
        <textarea rows={3} value={value} onChange={handleChange} className={`${inputClass} resize-none`} />
      ) : (
        <input type={type === 'toggle' ? 'text' : type} value={value} onChange={handleChange} className={inputClass} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.closest('form')?.requestSubmit(); }}} />
      )}
    </div>
  );
}
