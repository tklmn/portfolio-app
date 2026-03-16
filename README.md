<p align="center">
  <img src="frontend/public/favicon.svg" alt="Portfolio Logo" width="80" height="80" />
</p>

<h1 align="center">Developer Portfolio Platform</h1>

<p align="center">
  A modern, full-stack developer portfolio with an admin dashboard, blog system, multilingual support, and GitHub integration.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
</p>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## About

A production-ready developer portfolio platform built with React and Express. It goes beyond a static page — it includes a full content management system, a markdown-powered blog, multilingual support (English/German), SEO optimization, and the ability to import projects directly from the GitHub API.

Everything is manageable through a protected admin dashboard. No external CMS or database server required — it runs on SQLite.

---

## Features

### Public Website

- **Hero Section** — dynamic name, title, and introduction from admin settings
- **About Me** — biography with experience timeline and stats
- **Skills** — categorized skill grid with progress bars and icon mapping
- **Projects** — searchable and filterable by technology, category, and keyword
- **Blog** — markdown rendering with syntax highlighting, tags, reading time, and date
- **Contact Form** — rate-limited submissions stored in the database
- **Dark Mode** — toggle between light and dark themes, persisted in localStorage
- **Multilingual** — full English and German translations with one-click switcher
- **SEO** — dynamic meta tags, Open Graph, Twitter Cards, JSON-LD structured data
- **Scroll Animations** — IntersectionObserver-based reveal effects
- **Responsive** — mobile-first design with Tailwind CSS

### Admin Dashboard

- **Dashboard** — overview with project, skill, message, and post counts
- **Projects CRUD** — create, edit, delete with image upload, tech stack, and drag-and-drop reordering
- **Skills CRUD** — manage skills with categories, levels, icons, and drag-and-drop reordering
- **Blog Manager** — create and edit posts with markdown, tags, and publish/draft toggle
- **Messages Inbox** — view contact submissions with read/unread status
- **Trash Bin** — soft-delete for projects, skills, posts, and messages; restore or permanently delete from a unified trash page
- **Profile** — update admin name, email, and password
- **Site Settings** — full control over content, layout, SEO, and display options
- **GitHub Import** — browse your GitHub repos and import them as portfolio projects
- **JWT Authentication** — secure login with token-based session management

### Technical

- **Code Splitting** — lazy-loaded routes, admin bundle isolated from public pages
- **Error Boundary** — catches uncaught render errors, logs them, and offers in-place "Try Again" recovery without a full reload
- **Toast Notifications** — animated feedback replacing browser alerts
- **Accessible Confirm Dialogs** — keyboard-navigable, focus-trapped modals with `aria-labelledby`, `aria-describedby`, and context-aware button labels ("Move to Trash", "Delete Permanently", etc.)
- **Image Optimization** — lazy loading via IntersectionObserver with fade-in
- **Drag-and-Drop** — reorder projects and skills via @dnd-kit in admin panel
- **Pagination** — `usePagination` hook with URL, sessionStorage, and state modes; per-page count configurable via Settings
- **Sitemap & Robots.txt** — auto-generated from database content; XML values entity-escaped; trashed content excluded
- **Security** — Helmet headers, CORS validation, rate limiting, input validation, XSS sanitization, startup guard for missing `JWT_SECRET`, settings key/value length limits, GitHub proxy protected by auth
- **Soft Delete / Trash** — all content types support trash with restore and permanent delete; `deleted_at` column, no data is lost on first delete
- **Tests** — Vitest unit tests (frontend hooks) and integration tests (backend API)
- **Performance** — shared settings cache across all consumers (one network request per page load); passive scroll listeners

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite 6** | Build tool and dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client with JWT interceptor |
| **React Markdown** | Blog content rendering |
| **Remark GFM** | GitHub-flavored markdown |
| **Rehype Highlight** | Code syntax highlighting |
| **React Helmet Async** | Dynamic SEO meta tags |
| **React Icons** | Icon library |
| **@dnd-kit** | Drag-and-drop reordering |
| **highlight.js** | Code syntax highlighting in blog |
| **Vitest** | Unit and component testing |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | Runtime |
| **Express 4** | Web framework |
| **SQLite** (better-sqlite3) | Embedded database — no server required |
| **JSON Web Tokens** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Multer** | File uploads (project images) |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | Brute-force and spam protection |
| **Vitest + Supertest** | API integration testing |

---

## Installation

### Prerequisites

- **Node.js** 18 or higher — [download](https://nodejs.org)
- **npm** 9 or higher (included with Node.js)

Verify your versions:

```bash
node -v   # should be 18+
npm -v    # should be 9+
```

### 1. Clone the repository

```bash
git clone https://github.com/tklmn/portfolio-app.git
cd portfolio-app
```

### 2. Install dependencies

```bash
# Install root-level dev tools (concurrently)
npm install

# Install backend and frontend dependencies
npm run install:all
```

This runs `npm install` in both `backend/` and `frontend/` automatically.

### 3. Configure environment variables

Create the backend `.env` file:

```bash
cp backend/.env.example backend/.env   # if an example exists
# — or create it manually:
```

```env
# backend/.env
PORT=5000
JWT_SECRET=your-strong-random-secret-here
CORS_ORIGIN=http://localhost:5173
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Never commit `.env` to version control. It is already listed in `.gitignore`.

### 4. Seed the database

```bash
npm run seed
```

This creates `backend/db/portfolio.db` and inserts sample projects, skills, and a default admin user.

**Default admin credentials:**

```
Email:    admin@portfolio.com
Password: admin123
```

> Change these immediately at `/admin/profile` before deploying.

### 5. Start the development servers

```bash
npm run dev
```

This starts both the backend and frontend concurrently using colour-coded output:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Admin Panel | http://localhost:5173/admin/login |

---

## Configuration

### Environment Variables

All backend configuration lives in `backend/.env`:

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `5000` | No | Port the Express server listens on |
| `JWT_SECRET` | — | **Yes** | Secret key used to sign JWTs. Must be a long random string in production. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. The server **will not start** if this is missing. |
| `CORS_ORIGIN` | `http://localhost:5173` | No | Comma-separated list of allowed frontend origins. Set to your production domain when deploying |

### Site Settings (Admin Panel)

Everything visible on the public website is controlled through the Settings page at `/admin/settings`. Changes take effect immediately — no restart required.

#### Sections

Enable or disable entire sections of the public site. When a section is disabled it is hidden from the page **and** removed from the navigation bar automatically.

| Key | Default | Description |
|-----|---------|-------------|
| `section_hero` | on | Hero / landing section |
| `section_about` | on | About me + timeline |
| `section_skills` | on | Skills grid |
| `section_projects` | on | Projects grid |
| `section_blog` | on | Blog list + posts |
| `section_contact` | on | Contact form |

#### Hero Section

| Key | Description |
|-----|-------------|
| `hero_name` | Your name (displayed in the hero and used for SEO) |
| `hero_title` | Job title — supports multiple languages |
| `hero_subtitle` | Introduction text — supports multiple languages |
| `hero_image` | Profile image URL or `/uploads/...` path |
| `hero_badge_enabled` | Show/hide the years-of-experience badge |
| `hero_badge_text` | Badge text — supports multiple languages |

#### Footer

| Key | Description |
|-----|-------------|
| `footer_copyright` | Copyright line — supports multiple languages |
| `footer_subline` | Subline, e.g. "Built with React" — supports multiple languages |

#### Social Links & Contact

| Key | Description |
|-----|-------------|
| `social_github` | GitHub profile URL |
| `social_linkedin` | LinkedIn profile URL |
| `social_x` | X (Twitter) profile URL |
| `contact_email` | Email shown in the contact section |
| `contact_location` | Location text shown in the contact section |

#### SEO

| Key | Description |
|-----|-------------|
| `seo_title` | Browser tab title for the homepage |
| `seo_description` | Meta description used by search engines |
| `seo_keywords` | Comma-separated keywords |
| `site_url` | Full URL of your site, e.g. `https://yourname.dev` — used for Open Graph, JSON-LD, and the sitemap |

#### UI

| Key | Default | Description |
|-----|---------|-------------|
| `scroll_to_top_enabled` | on | Show/hide the scroll-to-top button |
| `pagination_projects_per_page` | `10` | Number of projects shown per page |
| `pagination_projects` | off | Show/hide project pagination controls |

#### Blog Post Display

Controls pagination and meta information on the blog list (`/blog`) and individual post pages (`/blog/:slug`).

| Key | Default | Description |
|-----|---------|-------------|
| `pagination_posts_per_page` | `10` | Number of blog posts shown per page |
| `pagination_posts` | off | Show/hide blog pagination controls |
| `blog_show_date` | on | Show the publication date |
| `blog_show_reading_time` | on | Show the estimated reading time |

#### Languages

| Key | Default | Description |
|-----|---------|-------------|
| `languages` | `en,de` | Comma-separated language codes. To add a language (e.g. French), add `fr` here and create `frontend/src/i18n/fr.json` with the same keys as `en.json` |

#### GitHub Integration

| Key | Description |
|-----|-------------|
| `github_username` | Your GitHub username. Used by the GitHub Import page to fetch your public repositories |

### Admin Profile

Update your admin account at `/admin/profile`:

- Change display name
- Change email address
- Change password (requires entering the current password)

---

## Usage

### Public Site

- Visit `http://localhost:5173` to see the portfolio
- Use the sticky navbar to jump between sections or scroll naturally
- Toggle dark/light mode with the sun/moon icon in the navbar
- Switch language (EN/DE) with the language button
- Filter projects by keyword, technology stack, or category
- Read blog posts — full markdown with syntax-highlighted code blocks
- Submit a contact message via the form (rate-limited to 5 messages per 15 minutes per IP)

### Admin Dashboard

1. Go to `http://localhost:5173/admin/login` and sign in
2. **Dashboard** — content overview (counts for projects, skills, messages, posts)
3. **Projects** — create/edit/delete projects; upload cover images; drag rows to reorder
4. **Skills** — manage skill name, category, proficiency level (0–100), and icon; drag to reorder
5. **Blog Posts** — write in markdown; add tags; toggle between Draft and Published
6. **Messages** — read contact submissions; mark as read; delete
7. **Trash** — recover deleted projects, skills, posts, or messages; or permanently remove them; tab selection persists on reload
8. **Profile** — update your name, email, or password
9. **Settings** — control all public-facing content and display options
10. **GitHub Import** — enter your username in Settings, then browse and import repos as projects

### Developer Scripts

```bash
# Start both servers (recommended)
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Seed/reset the database
npm run seed

# Build the frontend for production
npm run build

# Run all tests (backend + frontend)
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

---

## Project Structure

```
portfolio-app/
├── package.json                    # Root scripts: dev, seed, build, test
│
├── backend/
│   ├── server.js                   # Entry point — starts Express on PORT
│   ├── app.js                      # Express app factory (imported by server.js and tests)
│   ├── .env                        # Environment variables (not committed)
│   ├── vitest.config.js            # Vitest config — uses in-memory DB for tests
│   ├── db/
│   │   ├── init.js                 # Schema creation, migrations, and indexes
│   │   ├── settings.js             # loadSettings(db) helper — shared by seo, github routes
│   │   └── seed.js                 # Sample data seeder (run with npm run seed)
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication — attaches user to req
│   │   └── validate.js             # Input validation middleware (express-validator)
│   ├── routes/
│   │   ├── auth.js                 # POST /api/auth/login
│   │   ├── projects.js             # CRUD + image upload + reorder (soft delete)
│   │   ├── skills.js               # CRUD + reorder (soft delete)
│   │   ├── posts.js                # CRUD + tags + reading time calculation (soft delete)
│   │   ├── messages.js             # Contact form + admin inbox (soft delete)
│   │   ├── trash.js                # Unified trash — list, restore, permanent delete, empty
│   │   ├── settings.js             # Key-value site settings store
│   │   ├── tags.js                 # Blog tag management
│   │   ├── github.js               # GitHub API proxy + one-click import
│   │   ├── about.js                # About/timeline entries
│   │   └── seo.js                  # /sitemap.xml + /robots.txt
│   ├── tests/
│   │   └── api.test.js             # API integration tests (18 tests)
│   └── uploads/                    # Uploaded project images (gitignored)
│
└── frontend/
    ├── vite.config.js              # Vite + Tailwind + API proxy + Vitest config
    ├── index.html                  # HTML shell
    └── src/
        ├── App.jsx                 # Router, lazy routes, and context providers
        ├── api/
        │   └── axios.js            # Axios instance — adds JWT header, handles 401
        ├── i18n/
        │   ├── en.json             # English translations
        │   └── de.json             # German translations
        ├── context/
        │   ├── AuthContext.jsx     # JWT token storage and login/logout
        │   ├── ThemeContext.jsx     # Dark/light mode with localStorage persistence
        │   └── LanguageContext.jsx # Active language and translation helpers
        ├── hooks/
        │   ├── usePagination.js    # Pagination — url / session / state modes
        │   ├── useSettings.js      # Fetches and caches site settings; exports getSettingsCached()
        │   ├── useScrollReveal.js  # IntersectionObserver scroll animations
        │   └── useTranslateJson.js # Translates i18n JSON field values
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx      # Sticky navbar with section links + toggles
        │   │   ├── Footer.jsx      # Footer with configurable text
        │   │   ├── PublicLayout.jsx
        │   │   └── AdminLayout.jsx # Sidebar navigation for admin pages
        │   └── ui/
        │       ├── Toast.jsx       # Animated toast notification system
        │       ├── ConfirmDialog.jsx # Accessible modal confirmation dialog
        │       ├── SEOHead.jsx     # React Helmet wrapper for meta tags
        │       ├── LoadingSpinner.jsx
        │       ├── SectionHeading.jsx
        │       ├── OptimizedImage.jsx # Lazy-loaded image with fade-in
        │       ├── I18nField.jsx   # Tabbed multilingual input (admin forms)
        │       └── SettingsI18nField.jsx
        └── pages/
            ├── public/
            │   ├── HomePage.jsx    # Renders all sections based on settings
            │   ├── BlogPage.jsx    # Paginated, tag-filtered blog list
            │   ├── BlogPostPage.jsx # Individual post with markdown rendering
            │   └── sections/
            │       ├── Hero.jsx
            │       ├── About.jsx
            │       ├── Skills.jsx
            │       ├── Projects.jsx # Searchable + filterable project grid
            │       └── Contact.jsx
            └── admin/
                ├── LoginPage.jsx
                ├── DashboardPage.jsx
                ├── ProjectsPage.jsx
                ├── SkillsPage.jsx
                ├── PostsPage.jsx
                ├── MessagesPage.jsx
                ├── TrashPage.jsx       # Tabbed trash view — restore or permanently delete
                ├── ProfilePage.jsx
                ├── SettingsPage.jsx
                └── GitHubImportPage.jsx
```

---

## API Overview

All endpoints are prefixed with `/api` except SEO routes. Protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with email/password — returns JWT valid for 24 hours |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | No | List all projects. Supports `?search=`, `?tech=`, `?category=` |
| GET | `/api/projects/:id` | No | Get single project |
| POST | `/api/projects` | Yes | Create project (`multipart/form-data` for image upload) |
| PUT | `/api/projects/:id` | Yes | Update project |
| PATCH | `/api/projects/reorder` | Yes | Batch update sort order — body: `[{ id, sort_order }]` |
| DELETE | `/api/projects/:id` | Yes | Soft-delete project — moves to trash |

### Skills

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/skills` | No | List all skills ordered by `sort_order` |
| POST | `/api/skills` | Yes | Create skill |
| PUT | `/api/skills/:id` | Yes | Update skill |
| PATCH | `/api/skills/reorder` | Yes | Batch update sort order — body: `[{ id, sort_order }]` |
| DELETE | `/api/skills/:id` | Yes | Soft-delete skill — moves to trash |

### Blog Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | No | List published posts with tags |
| GET | `/api/posts/admin/all` | Yes | List all posts including drafts |
| GET | `/api/posts/:slug` | No | Get single post by slug |
| POST | `/api/posts` | Yes | Create post (slug auto-generated if empty) |
| PUT | `/api/posts/:id` | Yes | Update post |
| DELETE | `/api/posts/:id` | Yes | Soft-delete post — moves to trash |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages` | Yes | List all messages (newest first) |
| POST | `/api/messages` | No | Submit contact form — rate limited: 5 per 15 min per IP |
| PATCH | `/api/messages/:id/read` | Yes | Mark message as read |
| DELETE | `/api/messages/:id` | Yes | Soft-delete message — moves to trash |

### Trash

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trash` | Yes | List all trashed items grouped by type (`posts`, `projects`, `skills`, `messages`) |
| PATCH | `/api/trash/:type/:id/restore` | Yes | Restore a trashed item — clears `deleted_at` |
| DELETE | `/api/trash/:type/:id` | Yes | Permanently delete one item (removes project image from disk) |
| DELETE | `/api/trash` | Yes | Empty entire trash — permanently deletes all trashed items |

### Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/settings` | No | Get all settings as a flat key-value object |
| PUT | `/api/settings` | Yes | Save settings — body is the same flat object |

### Tags

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tags` | No | List all tags with post counts |
| POST | `/api/tags` | Yes | Create tag |
| DELETE | `/api/tags/:id` | Yes | Delete tag |

### GitHub

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/github/repos` | Yes | Fetch public repos for `github_username` from GitHub API |
| POST | `/api/github/import` | Yes | Import a repo as a project |

### SEO

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sitemap.xml` | Auto-generated sitemap including all published posts and projects |
| GET | `/robots.txt` | Auto-generated robots.txt pointing to the sitemap |

---

## Testing

Tests run against an isolated **in-memory SQLite database** — the production database is never touched.

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
cd frontend && npm run test:watch
cd backend  && npm run test:watch
```

### Frontend (Vitest + React Testing Library)

- **15 tests** covering the `usePagination` hook
- Modes tested: `state`, `url` (via MemoryRouter), `session` (via sessionStorage)

### Backend (Vitest + Supertest)

- **18 tests** covering the full API
- Health endpoint, auth (login, 400, 401), all public GET endpoints, protected route enforcement (401), contact form validation, and authenticated project CRUD

---

## Deployment

### Option 1: Traditional Server (VPS / bare metal)

```bash
# 1. Build the React frontend
npm run build
# Output: frontend/dist/

# 2. Set production environment variables on the server
export NODE_ENV=production
export JWT_SECRET=your-strong-secret
export CORS_ORIGIN=https://yourname.dev
export PORT=5000

# 3. Start the backend (serves the API; frontend is served by Nginx)
cd backend
node server.js
```

**Nginx configuration example:**

```nginx
server {
    listen 80;
    server_name yourname.dev;

    # Serve built frontend
    root /path/to/portfolio-app/frontend/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }

    # Uploads proxy
    location /uploads/ {
        proxy_pass http://localhost:5000;
    }

    # SEO routes proxy
    location ~ ^/(sitemap\.xml|robots\.txt)$ {
        proxy_pass http://localhost:5000;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Use [Certbot](https://certbot.eff.org) to add HTTPS.

### Option 2: Docker

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run install:all && npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist
WORKDIR /app/backend
RUN npm install --production
EXPOSE 5000
CMD ["node", "server.js"]
```

### Production Checklist

- [ ] Generate a strong `JWT_SECRET` and set it in the environment (server refuses to start without it)
- [ ] Change the default admin password at `/admin/profile` (minimum 8 characters)
- [ ] Set `CORS_ORIGIN` to your production domain
- [ ] Set `site_url` in admin Settings for correct SEO meta tags and sitemap URLs
- [ ] Configure HTTPS via a reverse proxy or hosting platform
- [ ] Set up a process manager (e.g. PM2) or container orchestration
- [ ] Enable gzip/brotli compression in your reverse proxy
- [ ] Point your domain's DNS to the server

---

## Contributing

Contributions are welcome. To contribute:

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Write tests** for any new behaviour
4. **Commit** your changes (`git commit -m "Add your feature"`)
5. **Push** to your branch (`git push origin feature/your-feature`)
6. **Open** a Pull Request

### Guidelines

- Follow the existing code style and folder structure
- Use functional React components with hooks
- Keep components small and focused
- Write or update tests for anything you change
- Write meaningful commit messages

---

## Author

**Tom Kilimann**

---

## License

This project currently has no license. All rights reserved.

---

## Future Improvements

- [ ] TypeScript migration for type safety across the codebase
- [ ] Rich markdown editor (WYSIWYG) in the admin blog manager
- [ ] Image gallery with drag-and-drop upload
- [ ] Analytics dashboard (page views, popular posts)
- [ ] Email notifications for new contact messages
- [ ] PWA support with offline capabilities
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Database migration system for schema versioning
- [ ] Comment system for blog posts
- [ ] RSS feed for blog subscribers
- [ ] Resume/CV download feature
- [ ] Additional languages (French, Spanish, etc.)
