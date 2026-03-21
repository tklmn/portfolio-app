import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/init.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import skillRoutes from './routes/skills.js';
import messageRoutes from './routes/messages.js';
import postRoutes from './routes/posts.js';
import settingsRoutes from './routes/settings.js';
import githubRoutes from './routes/github.js';
import tagRoutes from './routes/tags.js';
import seoRoutes from './routes/seo.js';
import aboutRoutes from './routes/about.js';
import trashRoutes from './routes/trash.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '.env') });

// Fail fast — a missing JWT_SECRET causes silent crypto failures at login time.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Set it in backend/.env before starting.');
  process.exit(1);
}
const app = express();

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if ((!origin && process.env.NODE_ENV !== 'production') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initDb();

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/trash', trashRoutes);
app.use('/', seoRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend build in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Express recognises error handlers by their arity (4 params) — next must stay even if unused.
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

export { app };
