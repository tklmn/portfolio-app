import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // Always run bcrypt to prevent timing-based user enumeration
  const dummy = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p19WOu9Nc/PeM39OWzu5ei';
  const valid = bcrypt.compareSync(password, user?.password || dummy);
  if (!user || !valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// GET current user profile
router.get('/me', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT update profile (name, email, password)
router.put('/me', authenticateToken, (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // If changing password, verify current password first
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password' });
    }
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    const hashed = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id);
  }

  // Update name and email
  if (name || email) {
    if (email && email !== user.email) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, user.id);
      if (existing) return res.status(400).json({ error: 'Email already in use' });
    }
    db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(
      name || user.name,
      email || user.email,
      user.id
    );
  }

  const updated = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(user.id);

  // Issue new token with updated info
  const token = jwt.sign(
    { id: updated.id, email: updated.email, name: updated.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ user: updated, token });
});

export default router;
