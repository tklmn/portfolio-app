import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../app.js';
import { getDb } from '../db/init.js';

// Known credentials for the in-memory test DB (completely separate from production)
const ADMIN_EMAIL = 'admin@portfolio.com';
const ADMIN_PASSWORD = 'admin123';

beforeAll(() => {
  // Seed a test admin into the isolated in-memory database
  const db = getDb();
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare("INSERT OR IGNORE INTO users (email, password, name) VALUES (?, ?, 'Admin')").run(ADMIN_EMAIL, hash);
});

// ─── Health ──────────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── Auth ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });
});

// ─── Public endpoints (no auth) ──────────────────────────────────────────────

describe('GET /api/projects', () => {
  it('returns 200 with an array', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/skills', () => {
  it('returns 200 with an array', async () => {
    const res = await request(app).get('/api/skills');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/posts', () => {
  it('returns 200 with an array', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/settings', () => {
  it('returns 200 with an object', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(Array.isArray(res.body)).toBe(false);
  });
});

describe('GET /api/tags', () => {
  it('returns 200 with an array', async () => {
    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ─── Protected endpoints (no token → 401) ────────────────────────────────────

describe('Protected routes without token', () => {
  const protectedRoutes = [
    { method: 'get', path: '/api/messages' },
    { method: 'get', path: '/api/posts/admin/all' },
    { method: 'post', path: '/api/projects' },
    { method: 'post', path: '/api/skills' },
  ];

  protectedRoutes.forEach(({ method, path }) => {
    it(`${method.toUpperCase()} ${path} returns 401`, async () => {
      const res = await request(app)[method](path);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});

// ─── Contact form ─────────────────────────────────────────────────────────────

describe('POST /api/messages (contact form)', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/messages').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('creates a message with valid data', async () => {
    const res = await request(app).post('/api/messages').send({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello from tests',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});

// ─── Authenticated CRUD (projects) ───────────────────────────────────────────

describe('Projects CRUD (authenticated)', () => {
  let token;
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    token = res.body.token;
  });

  it('creates a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .field('title', JSON.stringify({ en: 'Test Project' }))
      .field('description', JSON.stringify({ en: 'A test project' }))
      .field('tech_stack', 'React, Node.js')
      .field('featured', 'false');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('updates the project', async () => {
    const res = await request(app)
      .put(`/api/projects/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('title', JSON.stringify({ en: 'Updated Test Project' }))
      .field('featured', 'true');
    expect(res.status).toBe(200);
  });

  it('deletes the project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
