import { Router } from 'express';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const router = Router();

// GET all tags (public)
router.get('/', (req, res) => {
  const db = getDb();
  const tags = db.prepare(`
    SELECT t.*, COUNT(pt.post_id) as post_count
    FROM tags t
    LEFT JOIN post_tags pt ON pt.tag_id = t.id
    GROUP BY t.id
    ORDER BY t.name ASC
  `).all();
  res.json(tags);
});

// POST create tag (admin)
router.post('/', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Tag name is required' });

  const db = getDb();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').run(name, slug);
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(tag);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Tag already exists' });
    }
    throw err;
  }
});

// DELETE tag (admin)
router.delete('/:id', validateId, authenticateToken, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tag not found' });

  db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
  res.json({ message: 'Tag deleted' });
});

export default router;
