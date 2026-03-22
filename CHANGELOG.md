# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [1.3.0] - 2026-03-22

### Added
- Input length validation on all backend routes (projects, skills, about, posts, messages) via shared `validateFields` middleware
- Skill level range validation (0–100) on create and update
- Error states on public pages — Skills, Projects, and Blog now handle API failures gracefully
- Shared `displayName` utility extracted from four admin pages into `utils/displayName.js`

### Fixed
- Timing attack on login — `bcrypt.compareSync` now always runs even when the user is not found
- `useScrollReveal` dependency array — removed `isVisible` from `useCallback` deps to prevent stale closure
- Honeypot response now returns a randomized fake ID instead of a fixed value

### Improved
- `aria-label` added to language selector dropdowns in `I18nField` and `SettingsI18nField`
- Conditional error logging — production shows only error message, development shows full stack trace

---

## [1.2.0] - 2026-03-22

### Added
- GitHub import duplicate detection — already-imported repos show "Imported" badge; import blocked for repos in trash with hint to restore
- Robots/Crawling settings in admin — toggle search engine indexing and configure disallowed paths; changes apply immediately to `/robots.txt`
- Seed defaults for about stats (`about_stat_1/2/3_value` and `_label`)

### Fixed
- Empty i18n fields displaying raw JSON — `useTranslateJson` now uses nullish coalescing (`??`) instead of logical OR (`||`)
- Empty fields still rendering on public pages — about stats, bio, heading, description, company, hero fields, project description, blog excerpt, footer copyright, navbar logo, and contact info now hidden when empty instead of showing hardcoded fallback text
- Non-featured projects visible through search/filter — public project section now strictly shows only featured projects
- Resilient frontend serving — returns 503 instead of crashing when `index.html` is missing during a rebuild

### Security
- Honeypot field on contact form — silently discards bot submissions without revealing rejection

---

## [1.1.0] - 2026-03-22

### Added
- Plesk entry point (`app.js` in project root) for deployment on netcup EiWoMiSau shared hosting
- Backend serves frontend build statically in production (catch-all route for SPA)
- `.env.example` file for backend environment variables
- Plesk shared hosting deployment guide in README

### Fixed
- Project "featured" toggle not saving — `FormData` sends `"false"` as a truthy string; now compared against `"true"` explicitly
- Footer subline showing fallback text when the setting is empty
- CORS blocking same-origin requests in production — requests without an `Origin` header are now allowed
- `dotenv` import error on Plesk — removed from root `app.js`; backend resolves its own `.env` via `__dirname`

---

## [1.0.0] - 2026-03-17

### Added

#### Public Website
- Hero section with configurable name, job title, introduction text, profile image, and years-of-experience badge
- About section with biography, stats, and a visual timeline of work experience
- Skills section with categorised grid, proficiency bars, and icon mapping
- Projects section with search, technology filter, and category filter; paginated with configurable page size
- Blog with tag filtering, reading time, publication date, and markdown rendering (GitHub-flavoured markdown + syntax highlighting via highlight.js)
- Individual blog post pages with Open Graph and JSON-LD structured data
- Contact form with client-side validation; rate-limited to 5 submissions per 15 minutes per IP; stored in the database
- Sticky navigation bar with smooth-scroll anchors and automatic active-section highlighting
- Dark / light mode toggle persisted in `localStorage`
- Multilingual support — English and German out of the box; additional languages added by creating a JSON translation file and adding the language code in Settings
- Skip-to-content link for keyboard users
- Scroll-to-top button (configurable in Settings)
- Responsive layout with Tailwind CSS; mobile-first throughout
- Section visibility toggles — any section can be hidden from both the page and the navigation via Settings

#### Admin Dashboard
- JWT-based authentication with 24-hour token expiry; protected routes redirect to login
- Dashboard overview with live counts for projects, skills, unread messages, and posts
- Projects manager — create, edit, and soft-delete; image upload (JPEG/PNG/GIF/WebP, max 5 MB); drag-and-drop row reordering
- Skills manager — create, edit, and soft-delete; drag-and-drop row reordering
- Blog post manager — markdown editor with live content field; tag input; draft / published toggle; auto-generated slug with manual override; reading time calculated automatically
- Messages inbox — paginated list with split-pane detail view; mark as read; soft-delete
- About section editor — biography, configurable stats, and timeline entries with drag-and-drop sort
- Profile page — update display name, email address, and password
- GitHub Import — browse public repositories for any configured username and import them as projects with one click; stars, language, and topic metadata preserved
- Site Settings — single-page form covering hero content, footer, social links, contact info, SEO fields, section toggles, UI preferences, blog display options, and language configuration; all i18n fields support per-language input with tabbed editor
- Trash bin — tabbed view (Blog Posts / Projects / Skills / Messages) with pagination; selected tab persists in the URL on reload; restore to original location or permanently delete; Empty Trash action clears all types at once

#### Backend
- Express 4 API with all routes prefixed `/api`
- SQLite database via `better-sqlite3`; no external database server required
- Incremental migration system — new columns added via `ALTER TABLE` in `init.js`; safe to re-run on existing databases
- Shared `loadSettings(db)` helper consumed by SEO and GitHub routes; eliminates duplicated settings-fetch boilerplate
- Sitemap (`/sitemap.xml`) and robots.txt (`/robots.txt`) generated from live database content; trashed and unpublished content excluded; all values XML-entity-escaped
- `usePagination` hook — three modes: `url` (URL search params, survives page reload), `session` (sessionStorage, survives navigation), `state` (component-local); used across all admin list pages and the public blog and projects sections
- Seed script with sample projects, skills, blog posts, timeline entries, messages, and settings; default admin account created automatically
- In-memory SQLite (`DB_PATH=:memory:`) for test isolation — production database is never touched during test runs

#### Developer Experience
- Monorepo with root-level `npm run dev` starting both servers concurrently with colour-coded output
- Vitest for both frontend (15 tests, `usePagination` hook) and backend (18 tests, full API integration)
- Backend `app.js` exported separately from `server.js` entry point so tests can import the app without binding a port
- Vite dev proxy forwards `/api` requests to the backend; no CORS configuration needed in development

#### Accessibility
- `role="dialog"` with `aria-modal`, `aria-labelledby`, and `aria-describedby` on all confirm dialogs
- `role="alert"` on toast notifications; `role="log"` with `aria-live="polite"` on the toast container
- `role="alert"` on the error boundary fallback screen
- `aria-label` on all icon-only buttons (dark-mode toggle, mobile menu, language selector, dismiss notification)
- Focus automatically moved to the Cancel button when a confirm dialog opens
- Escape key closes all modals and dialogs

#### SEO
- Per-page `<title>` and `<meta name="description">` via react-helmet-async
- Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`)
- Twitter Card tags
- `article:published_time` and `article:tag` meta on blog post pages
- JSON-LD `WebSite` and `Article` structured data
- Auto-generated `sitemap.xml` with `<lastmod>`, `<changefreq>`, and `<priority>`
- `robots.txt` disallowing `/admin` and pointing to the sitemap

### Security

- Helmet HTTP security headers on all responses
- CORS restricted to configured `CORS_ORIGIN`; `null` origin accepted only outside production
- Login endpoint rate-limited to 10 attempts per 15 minutes per IP
- Contact form rate-limited to 5 submissions per 15 minutes per IP
- All SQL queries use parameterised statements; no string interpolation in queries
- HTML stripped from contact form input before storage to prevent stored XSS
- JWT verified on every protected request; token must be present and valid
- Auth middleware returns `401` (unauthenticated) for missing or invalid tokens — not `403`
- Server refuses to start if `JWT_SECRET` environment variable is not set
- Minimum admin password length of 8 characters enforced at the API level
- Settings `PUT` endpoint validates key length (≤ 100 chars) and value length (≤ 10 000 chars)
- GitHub repository proxy (`GET /api/github/repos`) requires authentication; previously public
- Project image path resolved against the uploads directory before deletion to prevent path traversal
- Sitemap values XML-entity-escaped to prevent malformed output from user-controlled `site_url` or slugs
- `AuthContext` wraps `localStorage` JSON parse in try/catch; corrupted data triggers automatic session clear
- `deleted_at IS NULL` filter applied to all public-facing and admin list queries; trashed items excluded from sitemap and GitHub duplicate-import check