import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'projects');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// GET all projects (public, with optional filters)
router.get('/', (req, res) => {
  const db = getDb();
  const { search, tech, category } = req.query;

  let sql = 'SELECT * FROM projects WHERE deleted_at IS NULL';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (tech) {
    sql += ' AND tech_stack LIKE ?';
    params.push(`%${tech}%`);
  }

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY sort_order ASC';

  const projects = db.prepare(sql).all(...params);
  res.json(projects);
});

// GET single project (public)
router.get('/:id', validateId, (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// POST create project (admin)
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  const { title, description, tech_stack, github_url, demo_url, featured, sort_order } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const db = getDb();
  const image = req.file ? `/uploads/projects/${req.file.filename}` : null;

  const result = db.prepare(
    'INSERT INTO projects (title, description, tech_stack, github_url, demo_url, image, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description || '', tech_stack || '', github_url || '', demo_url || '', image, String(featured) === 'true' ? 1 : 0, sort_order || 0);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(project);
});

// PUT update project (admin)
router.put('/:id', validateId, authenticateToken, upload.single('image'), (req, res) => {
  const { title, description, tech_stack, github_url, demo_url, featured, sort_order } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  const image = req.file ? `/uploads/projects/${req.file.filename}` : existing.image;

  // Clean up old image when a new one is uploaded
  if (req.file && existing.image) {
    const uploadsDir = path.resolve(__dirname, '..', 'uploads');
    const oldImagePath = path.resolve(__dirname, '..', existing.image);
    if (oldImagePath.startsWith(uploadsDir)) {
      fs.unlink(oldImagePath, () => {});
    }
  }

  db.prepare(
    'UPDATE projects SET title = ?, description = ?, tech_stack = ?, github_url = ?, demo_url = ?, image = ?, featured = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(
    title || existing.title,
    description ?? existing.description,
    tech_stack ?? existing.tech_stack,
    github_url ?? existing.github_url,
    demo_url ?? existing.demo_url,
    image,
    featured !== undefined ? (String(featured) === 'true' ? 1 : 0) : existing.featured,
    sort_order ?? existing.sort_order,
    req.params.id
  );

  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  res.json(project);
});

// PATCH reorder projects (admin) — accepts [{ id, sort_order }, ...]
router.patch('/reorder', authenticateToken, (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Array of { id, sort_order } required' });
  }

  const db = getDb();
  const update = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((entries) => {
    for (const { id, sort_order } of entries) {
      update.run(sort_order, id);
    }
  });
  reorder(items);

  const projects = db.prepare('SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY sort_order ASC').all();
  res.json(projects);
});

// DELETE project (admin) — soft delete
router.delete('/:id', validateId, authenticateToken, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  db.prepare('UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  res.json({ message: 'Project moved to trash' });
});

export default router;
