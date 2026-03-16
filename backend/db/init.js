import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, 'portfolio.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      tech_stack TEXT,
      github_url TEXT,
      demo_url TEXT,
      image TEXT,
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      level INTEGER DEFAULT 50,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT,
      excerpt TEXT,
      cover_image TEXT,
      published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (post_id, tag_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'briefcase',
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Migrations: add new columns to existing tables
  const migrations = [
    "ALTER TABLE posts ADD COLUMN tags TEXT DEFAULT ''",
    "ALTER TABLE posts ADD COLUMN reading_time INTEGER DEFAULT 0",
    "ALTER TABLE projects ADD COLUMN category TEXT DEFAULT ''",
    "ALTER TABLE projects ADD COLUMN github_stars INTEGER DEFAULT 0",
    "ALTER TABLE projects ADD COLUMN github_updated_at TEXT DEFAULT ''",
    "ALTER TABLE posts ADD COLUMN language TEXT DEFAULT 'en'",
    "ALTER TABLE projects ADD COLUMN deleted_at DATETIME DEFAULT NULL",
    "ALTER TABLE skills ADD COLUMN deleted_at DATETIME DEFAULT NULL",
    "ALTER TABLE messages ADD COLUMN deleted_at DATETIME DEFAULT NULL",
    "ALTER TABLE posts ADD COLUMN deleted_at DATETIME DEFAULT NULL",
  ];

  for (const sql of migrations) {
    try { db.exec(sql); } catch (e) { /* column already exists */ }
  }

  // Indexes for frequently queried columns
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)',
    'CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published)',
    'CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order)',
    'CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured)',
    'CREATE INDEX IF NOT EXISTS idx_skills_sort_order ON skills(sort_order)',
    'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_timeline_sort_order ON timeline(sort_order)',
    'CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id)',
    'CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id)',
  ];
  for (const sql of indexes) {
    db.exec(sql);
  }

  console.log('Database initialized');
}
