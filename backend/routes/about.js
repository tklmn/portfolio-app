import { Router } from 'express';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId, validateFields } from '../middleware/validate.js';

const router = Router();

// GET about data (public) — bio settings + timeline + stats
router.get('/', (req, res) => {
  const db = getDb();

  // Get about-related settings
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'about_%'").all();
  const settings = {};
  for (const row of rows) settings[row.key] = row.value;

  // Get timeline entries
  const timeline = db.prepare('SELECT * FROM timeline ORDER BY sort_order ASC').all();

  res.json({ settings, timeline });
});

// --- Timeline CRUD ---

// GET all timeline entries (admin)
router.get('/timeline', (req, res) => {
  const db = getDb();
  const entries = db.prepare('SELECT * FROM timeline ORDER BY sort_order ASC').all();
  res.json(entries);
});

const timelineLimits = validateFields({ year: 50, title: 300, company: 300, description: 2000 });

// POST create timeline entry (admin)
router.post('/timeline', authenticateToken, timelineLimits, (req, res) => {
  const { year, year_end, is_current, title, company, description, icon, sort_order } = req.body;
  if (!year || !title || !company) {
    return res.status(400).json({ error: 'Year, title, and company are required' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO timeline (year, year_end, is_current, title, company, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(year, year_end || '', is_current ? 1 : 0, title, company, description || '', icon || 'briefcase', sort_order || 0);

  const entry = db.prepare('SELECT * FROM timeline WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(entry);
});

// PUT update timeline entry (admin)
router.put('/timeline/:id', validateId, authenticateToken, timelineLimits, (req, res) => {
  const { year, year_end, is_current, title, company, description, icon, sort_order } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM timeline WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Timeline entry not found' });

  db.prepare(
    'UPDATE timeline SET year = ?, year_end = ?, is_current = ?, title = ?, company = ?, description = ?, icon = ?, sort_order = ? WHERE id = ?'
  ).run(
    year || existing.year,
    year_end ?? existing.year_end,
    is_current !== undefined ? (is_current ? 1 : 0) : existing.is_current,
    title || existing.title,
    company || existing.company,
    description ?? existing.description,
    icon ?? existing.icon,
    sort_order ?? existing.sort_order,
    req.params.id
  );

  const entry = db.prepare('SELECT * FROM timeline WHERE id = ?').get(req.params.id);
  res.json(entry);
});

// PATCH reorder timeline (admin)
router.patch('/timeline/reorder', authenticateToken, (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Array of { id, sort_order } required' });
  }

  const db = getDb();
  const update = db.prepare('UPDATE timeline SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((entries) => {
    for (const { id, sort_order } of entries) {
      update.run(sort_order, id);
    }
  });
  reorder(items);

  const entries = db.prepare('SELECT * FROM timeline ORDER BY sort_order ASC').all();
  res.json(entries);
});

// DELETE timeline entry (admin)
router.delete('/timeline/:id', validateId, authenticateToken, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM timeline WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Timeline entry not found' });

  db.prepare('DELETE FROM timeline WHERE id = ?').run(req.params.id);
  res.json({ message: 'Timeline entry deleted' });
});

export default router;
