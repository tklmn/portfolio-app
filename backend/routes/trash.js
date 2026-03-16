import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const TYPES = ['projects', 'skills', 'messages', 'posts'];

function labelFor(type, row) {
  if (type === 'projects' || type === 'posts') {
    const title = row.title || '';
    try { const p = JSON.parse(title); return p.en || p[Object.keys(p)[0]] || title; } catch { return title; }
  }
  if (type === 'skills') return row.name || '';
  if (type === 'messages') return `${row.name} <${row.email}>`;
  return String(row.id);
}

// GET /api/trash — list all trashed items grouped by type
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const result = {};
  for (const type of TYPES) {
    const rows = db.prepare(`SELECT * FROM ${type} WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`).all();
    result[type] = rows.map((r) => ({ ...r, _label: labelFor(type, r) }));
  }
  res.json(result);
});

// PATCH /api/trash/:type/:id/restore
router.patch('/:type/:id/restore', authenticateToken, (req, res) => {
  const { type, id } = req.params;
  if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid type' });
  const db = getDb();
  const row = db.prepare(`SELECT * FROM ${type} WHERE id = ? AND deleted_at IS NOT NULL`).get(id);
  if (!row) return res.status(404).json({ error: 'Item not found in trash' });
  db.prepare(`UPDATE ${type} SET deleted_at = NULL WHERE id = ?`).run(id);
  res.json({ message: 'Restored' });
});

// DELETE /api/trash/:type/:id — permanently delete one item
router.delete('/:type/:id', authenticateToken, (req, res) => {
  const { type, id } = req.params;
  if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid type' });
  const db = getDb();
  const row = db.prepare(`SELECT * FROM ${type} WHERE id = ? AND deleted_at IS NOT NULL`).get(id);
  if (!row) return res.status(404).json({ error: 'Item not found in trash' });

  // Clean up project image from disk on permanent delete
  if (type === 'projects' && row.image) {
    const uploadsDir = path.resolve(__dirname, '..', 'uploads');
    const imagePath = path.resolve(__dirname, '..', row.image);
    if (imagePath.startsWith(uploadsDir)) fs.unlink(imagePath, () => {});
  }

  db.prepare(`DELETE FROM ${type} WHERE id = ?`).run(id);
  res.json({ message: 'Permanently deleted' });
});

// DELETE /api/trash — empty entire trash
router.delete('/', authenticateToken, (req, res) => {
  const db = getDb();

  // Clean up project images
  const trashedProjects = db.prepare('SELECT image FROM projects WHERE deleted_at IS NOT NULL AND image IS NOT NULL').all();
  for (const p of trashedProjects) {
    if (p.image) {
      const uploadsDir = path.resolve(__dirname, '..', 'uploads');
      const imagePath = path.resolve(__dirname, '..', p.image);
      if (imagePath.startsWith(uploadsDir)) fs.unlink(imagePath, () => {});
    }
  }

  for (const type of TYPES) {
    db.prepare(`DELETE FROM ${type} WHERE deleted_at IS NOT NULL`).run();
  }
  res.json({ message: 'Trash emptied' });
});

export default router;
