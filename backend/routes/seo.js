import { Router } from 'express';
import { getDb } from '../db/init.js';
import { loadSettings } from '../db/settings.js';

const router = Router();

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// GET /sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  const db = getDb();
  const settings = loadSettings(db);
  const baseUrl = settings.site_url;
  if (!baseUrl) {
    res.set('Content-Type', 'application/xml');
    return res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>');
  }

  const posts = db.prepare(
    'SELECT slug, updated_at FROM posts WHERE published = 1 AND deleted_at IS NULL'
  ).all();

  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `  <url>\n    <loc>${escapeXml(baseUrl)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    `  <url>\n    <loc>${escapeXml(baseUrl)}/blog</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ...posts.map((p) => {
      const lastmod = p.updated_at?.split(' ')[0] || today;
      return `  <url>\n    <loc>${escapeXml(baseUrl)}/blog/${escapeXml(p.slug)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const db = getDb();
  const settings = loadSettings(db);
  const baseUrl = settings.site_url;
  const allowIndexing = settings.robots_allow_indexing !== 'false';

  const lines = ['User-agent: *'];

  if (!allowIndexing) {
    lines.push('Disallow: /');
  } else {
    lines.push('Allow: /');
    // Parse custom disallowed paths (one per line), always include /admin
    const raw = settings.robots_disallow_paths || '';
    const customPaths = raw.split('\n').map((p) => p.trim()).filter(Boolean);
    const disallowed = new Set(customPaths);
    disallowed.add('/admin');
    for (const p of disallowed) {
      lines.push(`Disallow: ${p}`);
    }
    if (baseUrl) {
      lines.push('', `Sitemap: ${baseUrl}/sitemap.xml`);
    }
  }

  res.set('Content-Type', 'text/plain');
  res.send(lines.join('\n') + '\n');
});

export default router;
