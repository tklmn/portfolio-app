/**
 * Parse an i18n JSON value and return the English text (or first available language).
 * Falls back to the raw string if parsing fails.
 */
export function displayName(val) {
  if (!val) return '';
  try {
    const p = JSON.parse(val);
    return p.en || p[Object.keys(p)[0]] || val;
  } catch {
    return val;
  }
}
