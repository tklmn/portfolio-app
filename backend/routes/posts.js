import { Router } from 'express';
import { getDb } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const router = Router();

// GET all published posts (public)
router.get('/', (req, res) => {
  const db = getDb();
  const posts = db.prepare('SELECT * FROM posts WHERE published = 1 AND deleted_at IS NULL ORDER BY created_at DESC').all();

  // Batch load all tags for these posts in one query instead of N+1
  if (posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const placeholders = postIds.map(() => '?').join(',');
    const allTags = db.prepare(`
      SELECT pt.post_id, t.id, t.name, t.slug FROM tags t
      JOIN post_tags pt ON pt.tag_id = t.id
      WHERE pt.post_id IN (${placeholders})
    `).all(...postIds);

    // Group tags by post_id
    const tagsByPost = {};
    for (const tag of allTags) {
      if (!tagsByPost[tag.post_id]) tagsByPost[tag.post_id] = [];
      tagsByPost[tag.post_id].push({ id: tag.id, name: tag.name, slug: tag.slug });
    }
    for (const post of posts) {
      post.tagList = tagsByPost[post.id] || [];
    }
  }
  res.json(posts);
});

// GET all posts including drafts (admin only)
router.get('/admin/all', authenticateToken, (req, res) => {
  const db = getDb();
  const posts = db.prepare('SELECT * FROM posts WHERE deleted_at IS NULL ORDER BY created_at DESC').all();
  res.json(posts);
});

// GET single post by slug (public)
router.get('/:slug', (req, res) => {
  const db = getDb();
  // Try by slug first, then by id
  let post = db.prepare('SELECT * FROM posts WHERE slug = ? AND deleted_at IS NULL').get(req.params.slug);
  if (!post) {
    post = db.prepare('SELECT * FROM posts WHERE id = ? AND deleted_at IS NULL').get(req.params.slug);
  }
  if (!post) return res.status(404).json({ error: 'Post not found' });

  // Attach tag objects
  post.tagList = db.prepare(`
    SELECT t.id, t.name, t.slug FROM tags t
    JOIN post_tags pt ON pt.tag_id = t.id
    WHERE pt.post_id = ?
  `).all(post.id);

  res.json(post);
});

// Extract plain text from a possibly JSON-encoded i18n value (use 'en' for slugs)
function extractText(val) {
  if (!val) return '';
  try { const p = JSON.parse(val); return p.en || p[Object.keys(p)[0]] || val; } catch { return val; }
}

// POST create post (admin)
router.post('/', authenticateToken, (req, res) => {
  const { title, slug, content, excerpt, published } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const db = getDb();
  const titleText = extractText(title);
  const postSlug = slug || titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check slug uniqueness
  const existing = db.prepare('SELECT id FROM posts WHERE slug = ?').get(postSlug);
  if (existing) return res.status(400).json({ error: 'A post with this slug already exists' });

  const contentText = extractText(content);
  const wordCount = (contentText || '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const tagsStr = req.body.tags || '';

  const result = db.prepare(
    'INSERT INTO posts (title, slug, content, excerpt, published, reading_time, tags) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, postSlug, content || '', excerpt || '', published ? 1 : 0, readingTime, tagsStr);

  // Associate tags
  if (tagsStr) {
    const tagNames = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)');
    const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const linkTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)');
    for (const tagName of tagNames) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      insertTag.run(tagName, tagSlug);
      const tag = getTag.get(tagName);
      if (tag) linkTag.run(result.lastInsertRowid, tag.id);
    }
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(post);
});

// PUT update post (admin)
router.put('/:id', validateId, authenticateToken, (req, res) => {
  const { title, slug, content, excerpt, published } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM posts WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Post not found' });

  const newSlug = slug || existing.slug;

  // Check slug uniqueness if changed
  if (newSlug !== existing.slug) {
    const slugExists = db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(newSlug, req.params.id);
    if (slugExists) return res.status(400).json({ error: 'A post with this slug already exists' });
  }

  const updatedContent = content ?? existing.content;
  const wordCount = (extractText(updatedContent) || '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const tagsStr = req.body.tags ?? existing.tags;

  db.prepare(
    'UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, published = ?, reading_time = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(
    title || existing.title,
    newSlug,
    updatedContent,
    excerpt ?? existing.excerpt,
    published !== undefined ? (published ? 1 : 0) : existing.published,
    readingTime,
    tagsStr,
    req.params.id
  );

  // Reassociate tags
  db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(req.params.id);
  if (tagsStr) {
    const tagNames = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)');
    const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const linkTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)');
    for (const tagName of tagNames) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      insertTag.run(tagName, tagSlug);
      const tag = getTag.get(tagName);
      if (tag) linkTag.run(parseInt(req.params.id), tag.id);
    }
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  res.json(post);
});

// DELETE post (admin) — soft delete
router.delete('/:id', validateId, authenticateToken, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM posts WHERE id = ? AND deleted_at IS NULL').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Post not found' });

  db.prepare('UPDATE posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  res.json({ message: 'Post moved to trash' });
});

export default router;
