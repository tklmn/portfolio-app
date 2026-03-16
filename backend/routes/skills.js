import { Router } from 'express';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const router = Router();

// GET all skills (public)
router.get('/', (req, res) => {
  const db = getDb();
  const skills = db.prepare('SELECT * FROM skills WHERE deleted_at IS NULL ORDER BY sort_order ASC').all();
  res.json(skills);
});

// POST create skill (admin)
router.post('/', authenticateToken, (req, res) => {
  const { name, category, level, icon, sort_order } = req.body;
  if (!name) return res.status(400).json({ error: 'Skill name is required' });

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO skills (name, category, level, icon, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(name, category || '', level || 50, icon || '', sort_order || 0);

  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(skill);
});

// PUT update skill (admin)
router.put('/:id', validateId, authenticateToken, (req, res) => {
  const { name, category, level, icon, sort_order } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM skills WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Skill not found' });

  db.prepare(
    'UPDATE skills SET name = ?, category = ?, level = ?, icon = ?, sort_order = ? WHERE id = ?'
  ).run(
    name || existing.name,
    category ?? existing.category,
    level ?? existing.level,
    icon ?? existing.icon,
    sort_order ?? existing.sort_order,
    req.params.id
  );

  const skill = db.prepare('SELECT * FROM skills WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  res.json(skill);
});

// PATCH reorder skills (admin) — accepts [{ id, sort_order }, ...]
router.patch('/reorder', authenticateToken, (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Array of { id, sort_order } required' });
  }

  const db = getDb();
  const update = db.prepare('UPDATE skills SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((entries) => {
    for (const { id, sort_order } of entries) {
      update.run(sort_order, id);
    }
  });
  reorder(items);

  const skills = db.prepare('SELECT * FROM skills WHERE deleted_at IS NULL ORDER BY sort_order ASC').all();
  res.json(skills);
});

// DELETE skill (admin) — soft delete
router.delete('/:id', validateId, authenticateToken, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM skills WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Skill not found' });

  db.prepare('UPDATE skills SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  res.json({ message: 'Skill moved to trash' });
});

export default router;
