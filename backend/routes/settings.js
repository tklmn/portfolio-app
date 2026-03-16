import { Router } from 'express';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET all settings (public — used by frontend for hero text, social links, etc.)
router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

const KEY_MAX = 100;
const VALUE_MAX = 10_000;

// PUT update settings (admin)
router.put('/', authenticateToken, (req, res) => {
  const db = getDb();
  const updates = req.body;

  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ error: 'Settings object required' });
  }

  const entries = Object.entries(updates);

  for (const [key, value] of entries) {
    if (!key || typeof key !== 'string' || key.length > KEY_MAX) {
      return res.status(400).json({ error: `Invalid settings key: "${key}"` });
    }
    if (String(value).length > VALUE_MAX) {
      return res.status(400).json({ error: `Value for "${key}" exceeds maximum length` });
    }
  }

  const upsert = db.prepare(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
  );

  const updateMany = db.transaction((rows) => {
    for (const [key, value] of rows) {
      upsert.run(key, String(value));
    }
  });

  updateMany(entries);

  // Return updated settings
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

export default router;
