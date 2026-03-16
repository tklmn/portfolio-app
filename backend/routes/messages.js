import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const router = Router();

// Strip HTML tags to prevent stored XSS
function sanitize(str) {
  return str.replace(/<[^>]*>/g, '').trim();
}

// Rate limit for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages, please try again later' },
});

// GET all messages (admin)
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const messages = db.prepare('SELECT * FROM messages WHERE deleted_at IS NULL ORDER BY created_at DESC').all();
  res.json(messages);
});

// POST create message (public - contact form)
router.post('/', contactLimiter, (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)'
  ).run(sanitize(name), sanitize(email), sanitize(message));

  res.status(201).json({ id: result.lastInsertRowid, message: 'Message sent successfully' });
});

// PATCH mark as read (admin)
router.patch('/:id/read', validateId, authenticateToken, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE messages SET read = 1 WHERE id = ? AND deleted_at IS NULL').run(req.params.id);
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  res.json(msg);
});

// DELETE message (admin) — soft delete
router.delete('/:id', validateId, authenticateToken, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM messages WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Message not found' });

  db.prepare('UPDATE messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  res.json({ message: 'Message moved to trash' });
});

export default router;
