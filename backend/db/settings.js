/**
 * Shared helper to load all settings from the database into a plain object.
 * Used by routes that need settings but don't own the settings router.
 */
export function loadSettings(db) {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) settings[row.key] = row.value;
  return settings;
}
