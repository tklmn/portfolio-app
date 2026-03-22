import { Router } from 'express';
import { getDb } from '../db/init.js';
import { loadSettings } from '../db/settings.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET repos from GitHub API (proxy to avoid CORS/rate limits) — admin only
router.get('/repos', authenticateToken, async (req, res) => {
  const db = getDb();
  const settings = loadSettings(db);

  const username = settings.github_username;
  if (!username) {
    return res.json([]);
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'portfolio-app',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'GitHub API error' });
    }

    const repos = await response.json();
    // Check which repos are actively imported (not trashed)
    const imported = db.prepare("SELECT github_url FROM projects WHERE github_url IS NOT NULL AND github_url != '' AND deleted_at IS NULL").all();
    const importedSet = new Set(imported.map((r) => r.github_url));

    const simplified = repos.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      updated_at: r.updated_at,
      topics: r.topics || [],
      import_status: importedSet.has(r.html_url) ? 'imported' : null,
    }));

    res.json(simplified);
  } catch (err) {
    console.error('GitHub API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch GitHub repos' });
  }
});

// POST import a GitHub repo as a project (admin)
router.post('/import', authenticateToken, async (req, res) => {
  const { name, description, html_url, homepage, language, stargazers_count, topics, updated_at } = req.body;

  if (!name) return res.status(400).json({ error: 'Repository name is required' });

  const db = getDb();

  // Check if project already exists with this GitHub URL (only active, not trashed)
  const existing = db.prepare('SELECT id FROM projects WHERE github_url = ? AND deleted_at IS NULL').get(html_url);
  if (existing) {
    return res.status(400).json({ error: 'This repository has already been imported' });
  }

  const techStack = topics && topics.length > 0
    ? topics.join(',')
    : language || '';

  const result = db.prepare(
    'INSERT INTO projects (title, description, tech_stack, github_url, demo_url, featured, sort_order, category, github_stars, github_updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    name,
    description || '',
    techStack,
    html_url || '',
    homepage || '',
    0,
    0,
    'GitHub Import',
    stargazers_count || 0,
    updated_at || ''
  );

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(project);
});

// DELETE remove an imported GitHub project (admin)
router.delete('/import', authenticateToken, (req, res) => {
  const { github_url } = req.body;
  if (!github_url) return res.status(400).json({ error: 'github_url is required' });

  const db = getDb();
  const project = db.prepare('SELECT id FROM projects WHERE github_url = ? AND deleted_at IS NULL').get(github_url);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  db.prepare('UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(project.id);
  res.json({ message: 'Project removed' });
});

export default router;
