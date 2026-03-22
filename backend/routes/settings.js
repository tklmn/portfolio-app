import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Multer setup for hero image upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'hero');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `hero-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

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

// POST upload hero image (admin)
router.post('/hero-image', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });

  const db = getDb();
  const imagePath = `/uploads/hero/${req.file.filename}`;

  // Remove old hero image if it exists
  const old = db.prepare("SELECT value FROM settings WHERE key = 'hero_image'").get();
  if (old?.value && old.value.startsWith('/uploads/hero/')) {
    const oldPath = path.join(__dirname, '..', old.value);
    fs.unlink(oldPath, () => {});
  }

  db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('hero_image', ?, CURRENT_TIMESTAMP)").run(imagePath);
  res.json({ hero_image: imagePath });
});

// DELETE remove hero image (admin)
router.delete('/hero-image', authenticateToken, (req, res) => {
  const db = getDb();
  const old = db.prepare("SELECT value FROM settings WHERE key = 'hero_image'").get();
  if (old?.value && old.value.startsWith('/uploads/hero/')) {
    const oldPath = path.join(__dirname, '..', old.value);
    fs.unlink(oldPath, () => {});
  }
  db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('hero_image', '', CURRENT_TIMESTAMP)").run();
  res.json({ hero_image: '' });
});

export default router;
