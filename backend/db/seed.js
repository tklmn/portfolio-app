import bcrypt from 'bcryptjs';
import { initDb, getDb } from './init.js';

initDb();
const db = getDb();

// Clear existing data so seed is re-runnable
db.exec(`
  DELETE FROM post_tags;
  DELETE FROM tags;
  DELETE FROM timeline;
  DELETE FROM settings;
  DELETE FROM posts;
  DELETE FROM messages;
  DELETE FROM skills;
  DELETE FROM projects;
  DELETE FROM users;
`);

// Seed admin user
const hashedPassword = bcrypt.hashSync('admin123', 10);
const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (email, password, name) VALUES (?, ?, ?)'
);
insertUser.run('admin@portfolio.com', hashedPassword, 'Admin');

// Seed projects
const insertProject = db.prepare(
  'INSERT INTO projects (title, description, tech_stack, github_url, demo_url, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const projects = [
  ['{"en":"E-Commerce Platform","de":"E-Commerce Plattform"}', '{"en":"A full-stack e-commerce solution with payment integration, user authentication, and real-time inventory management.","de":"Eine Full-Stack E-Commerce-Lösung mit Zahlungsintegration, Benutzerauthentifizierung und Echtzeit-Bestandsverwaltung."}', 'React,Node.js,PostgreSQL,Stripe', 'https://github.com/user/ecommerce', 'https://ecommerce-demo.com', 1, 1],
  ['{"en":"Task Management App","de":"Aufgabenverwaltungs-App"}', '{"en":"Collaborative task management tool with real-time updates, drag-and-drop interface, and team workspaces.","de":"Kollaboratives Aufgabenverwaltungstool mit Echtzeit-Updates, Drag-and-Drop-Oberfläche und Team-Arbeitsbereichen."}', 'Vue.js,Express,MongoDB,Socket.io', 'https://github.com/user/taskapp', 'https://taskapp-demo.com', 1, 2],
  ['{"en":"Weather Dashboard","de":"Wetter-Dashboard"}', '{"en":"Real-time weather dashboard with interactive maps, forecast charts, and location-based alerts.","de":"Echtzeit-Wetter-Dashboard mit interaktiven Karten, Vorhersagediagrammen und standortbasierten Benachrichtigungen."}', 'React,TypeScript,D3.js,OpenWeather API', 'https://github.com/user/weather', 'https://weather-demo.com', 1, 3],
  ['{"en":"Chat Application","de":"Chat-Anwendung"}', '{"en":"Real-time messaging app with end-to-end encryption, file sharing, and group conversations.","de":"Echtzeit-Messaging-App mit Ende-zu-Ende-Verschlüsselung, Dateifreigabe und Gruppenunterhaltungen."}', 'React,Socket.io,Node.js,Redis', 'https://github.com/user/chat', 'https://chat-demo.com', 0, 4],
  ['{"en":"Portfolio Generator","de":"Portfolio-Generator"}', '{"en":"CLI tool that generates beautiful portfolio websites from a simple JSON configuration.","de":"CLI-Tool zur Erstellung schöner Portfolio-Websites aus einer einfachen JSON-Konfiguration."}', 'Node.js,Handlebars,CSS,CLI', 'https://github.com/user/portfolio-gen', '', 0, 5],
  ['{"en":"API Gateway","de":"API-Gateway"}', '{"en":"Microservices API gateway with rate limiting, authentication, and request routing.","de":"Microservices API-Gateway mit Rate-Limiting, Authentifizierung und Request-Routing."}', 'Go,Docker,Redis,gRPC', 'https://github.com/user/gateway', '', 0, 6],
];

for (const p of projects) {
  insertProject.run(...p);
}

// Seed skills
const insertSkill = db.prepare(
  'INSERT INTO skills (name, category, level, icon, sort_order) VALUES (?, ?, ?, ?, ?)'
);

const skills = [
  // Frontend
  ['JavaScript', 'Frontend', 90, 'SiJavascript', 1],
  ['TypeScript', 'Frontend', 85, 'SiTypescript', 2],
  ['React', 'Frontend', 90, 'SiReact', 3],
  ['HTML5', 'Frontend', 95, 'SiHtml5', 4],
  ['Tailwind CSS', 'Frontend', 85, 'SiTailwindcss', 5],
  ['Bootstrap', 'Frontend', 70, 'SiBootstrap', 6],
  ['Sass', 'Frontend', 75, 'SiSass', 7],
  // Backend
  ['Node.js', 'Backend', 85, 'SiNodedotjs', 8],
  ['PHP', 'Backend', 80, 'SiPhp', 9],
  ['Laravel', 'Backend', 75, 'SiLaravel', 10],
  ['MySQL', 'Backend', 70, 'SiMysql', 11],
  ['SQLite', 'Backend', 65, 'SiSqlite', 12],
  // DevOps
  ['Docker', 'DevOps', 70, 'SiDocker', 13],
  ['Apache', 'DevOps', 65, 'SiApache', 14],
  ['Linux', 'DevOps', 75, 'SiLinux', 15],
  // Tools
  ['Git', 'Tools', 85, 'SiGit', 16],
  ['GitHub', 'Tools', 85, 'SiGithub', 17],
  ['GitLab', 'Tools', 70, 'SiGitlab', 18],
  ['Bitbucket', 'Tools', 65, 'SiBitbucket', 19],
  ['Jira', 'Tools', 70, 'SiJira', 20],
  ['Slack', 'Tools', 75, 'SiSlack', 21],
  ['Trello', 'Tools', 65, 'SiTrello', 22],
  ['NPM', 'Tools', 80, 'SiNpm', 24],
  ['Vite', 'Tools', 80, 'SiVite', 25],
  ['Windows', 'Tools', 70, 'FaWindows', 26],
  ['Apple', 'Tools', 65, 'FaApple', 27],
  // CMS
  ['TYPO3', 'CMS', 80, 'SiTypo3', 28],
  ['WordPress', 'CMS', 75, 'SiWordpress', 29],
];

for (const s of skills) {
  insertSkill.run(...s);
}

// Seed messages
const insertMessage = db.prepare(
  'INSERT INTO messages (name, email, message, read) VALUES (?, ?, ?, ?)'
);

const messages = [
  ['Alice Johnson', 'alice@example.com', 'Hi! I love your portfolio. Would you be interested in a freelance project?', 1],
  ['Bob Smith', 'bob@company.com', 'We have an opening for a senior developer. Your work is impressive!', 0],
  ['Carol Davis', 'carol@startup.io', 'Great projects! Would love to discuss a collaboration opportunity.', 0],
];

for (const m of messages) {
  insertMessage.run(...m);
}

// Seed blog posts
const insertPost = db.prepare(
  'INSERT INTO posts (title, slug, content, excerpt, published) VALUES (?, ?, ?, ?, ?)'
);

const posts = [
  ['Getting Started with React Hooks', 'getting-started-react-hooks', 'React Hooks revolutionized the way we write React components. In this post, we will explore useState, useEffect, and custom hooks.\n\n## Why Hooks?\n\nBefore hooks, we had to use class components for state and lifecycle methods. Hooks let us use these features in functional components.\n\n## useState\n\nThe useState hook lets you add state to functional components:\n\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n## useEffect\n\nuseEffect handles side effects like data fetching and subscriptions:\n\n```jsx\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```\n\nHooks make our code cleaner and more reusable.', 'Learn how React Hooks can simplify your component logic and make your code more reusable.', 1],
  ['Building REST APIs with Express', 'building-rest-apis-express', 'Express.js is the most popular Node.js framework for building web APIs. Let us build a complete REST API from scratch.\n\n## Setup\n\nFirst, initialize your project and install Express:\n\n```bash\nnpm init -y\nnpm install express\n```\n\n## Creating Routes\n\nExpress makes routing simple and intuitive:\n\n```javascript\napp.get("/api/users", (req, res) => {\n  res.json(users);\n});\n```\n\n## Middleware\n\nMiddleware functions have access to the request and response objects. They are perfect for authentication, logging, and validation.\n\nExpress is lightweight yet powerful enough for production APIs.', 'A comprehensive guide to building production-ready REST APIs using Express.js and Node.js.', 1],
  ['Why TypeScript is Worth Learning', 'why-typescript-worth-learning', 'TypeScript adds static typing to JavaScript, catching errors before they reach production.\n\n## Type Safety\n\nTypeScript catches common errors at compile time:\n\n```typescript\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n```\n\n## Better Developer Experience\n\nWith TypeScript, your IDE can provide better autocomplete, refactoring tools, and documentation.\n\n## Gradual Adoption\n\nYou do not need to convert your entire project at once. TypeScript can be adopted gradually.\n\nThe investment in learning TypeScript pays off quickly with fewer bugs and better code quality.', 'Discover why TypeScript has become essential for modern web development and how to get started.', 1],
];

for (const p of posts) {
  insertPost.run(...p);
}

// Clear settings and tags
db.exec(`
  DELETE FROM post_tags;
  DELETE FROM tags;
  DELETE FROM settings;
`);

// Seed site settings
const insertSetting = db.prepare(
  'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
);

const settings = {
  // Site
  'site_logo_text': '<Portfolio />',
  // Sections — enable/disable
  'section_hero': 'true',
  'section_about': 'true',
  'section_skills': 'true',
  'section_projects': 'true',
  'section_blog': 'true',
  'section_contact': 'true',
  // Hero — translatable fields have _en and _de variants
  'hero_name': 'John Developer',
  'hero_title_en': 'Full-Stack Web Developer',
  'hero_title_de': 'Full-Stack Webentwickler',
  'hero_subtitle_en': 'I build exceptional digital experiences with modern technologies. Passionate about clean code, great UI/UX, and turning ideas into reality.',
  'hero_subtitle_de': 'Ich entwickle digitale Erlebnisse mit modernen Technologien. Leidenschaftlich für sauberen Code, großartiges UI/UX und die Umsetzung von Ideen.',
  'hero_image': '',
  'hero_badge_enabled': 'true',
  'hero_badge_text_en': '5+ Years',
  'hero_badge_text_de': '5+ Jahre',
  'scroll_to_top_enabled': 'true',
  'pagination_projects': 'false',
  'pagination_projects_per_page': '6',
  'pagination_posts': 'false',
  'pagination_posts_per_page': '10',
  'languages': 'en,de',
  // About — translatable
  'about_heading_en': 'Who am I?',
  'about_heading_de': 'Wer bin ich?',
  'about_bio_en': 'I am a passionate full-stack developer with over 5 years of experience building web applications. I love creating elegant solutions to complex problems and bringing ideas to life through code.',
  'about_bio_de': 'Ich bin ein leidenschaftlicher Full-Stack-Entwickler mit über 5 Jahren Erfahrung in der Entwicklung von Webanwendungen. Ich liebe es, elegante Lösungen für komplexe Probleme zu finden.',
  // About stats
  'about_stat_1_value': '5+',
  'about_stat_1_label_en': 'Years Experience',
  'about_stat_1_label_de': 'Jahre Erfahrung',
  'about_stat_2_value': '50+',
  'about_stat_2_label_en': 'Projects Completed',
  'about_stat_2_label_de': 'Projekte abgeschlossen',
  'about_stat_3_value': '20+',
  'about_stat_3_label_en': 'Happy Clients',
  'about_stat_3_label_de': 'Zufriedene Kunden',
  // Footer
  'footer_copyright_en': '\u00A9 2026 Portfolio. All rights reserved.',
  'footer_copyright_de': '\u00A9 2026 Portfolio. Alle Rechte vorbehalten.',
  'footer_subline_en': 'Built with React, Tailwind CSS & Express',
  'footer_subline_de': 'Erstellt mit React, Tailwind CSS & Express',
  // Social
  'social_github': 'https://github.com',
  'social_linkedin': 'https://linkedin.com',
  'social_x': 'https://x.com',
  'social_email': 'hello@portfolio.com',
  'seo_title': 'John Developer — Full-Stack Web Developer Portfolio',
  'seo_description': 'Full-stack web developer specializing in React, Node.js, and modern web technologies. View my projects and get in touch.',
  'seo_keywords': 'web developer, full-stack, react, node.js, portfolio',
  'seo_image': '',
  'site_url': 'https://johndeveloper.com',
  'github_username': '',
  'contact_email': 'hello@portfolio.com',
  'contact_location': 'San Francisco, CA',
  // Robots
  'robots_allow_indexing': 'true',
  'robots_disallow_paths': '/admin',
};

for (const [key, value] of Object.entries(settings)) {
  insertSetting.run(key, value);
}

// Seed tags
const insertTag = db.prepare(
  'INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)'
);

const tagsList = [
  ['React', 'react'],
  ['JavaScript', 'javascript'],
  ['TypeScript', 'typescript'],
  ['Node.js', 'nodejs'],
  ['Express', 'express'],
  ['Tutorial', 'tutorial'],
  ['Web Development', 'web-development'],
  ['Best Practices', 'best-practices'],
];

for (const [name, slug] of tagsList) {
  insertTag.run(name, slug);
}

// Link tags to posts
const getTagId = db.prepare('SELECT id FROM tags WHERE slug = ?');
const getPostId = db.prepare('SELECT id FROM posts WHERE slug = ?');
const insertPostTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)');

const postTags = {
  'getting-started-react-hooks': ['react', 'javascript', 'tutorial'],
  'building-rest-apis-express': ['nodejs', 'express', 'tutorial'],
  'why-typescript-worth-learning': ['typescript', 'javascript', 'best-practices'],
};

for (const [postSlug, tagSlugs] of Object.entries(postTags)) {
  const post = getPostId.get(postSlug);
  if (!post) continue;
  for (const tagSlug of tagSlugs) {
    const tag = getTagId.get(tagSlug);
    if (tag) insertPostTag.run(post.id, tag.id);
  }
}

// Update posts with reading time and tags string
const allPosts = db.prepare('SELECT id, content FROM posts').all();
for (const post of allPosts) {
  const wordCount = (post.content || '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  // Get tag names for this post
  const postTagNames = db.prepare(`
    SELECT t.name FROM tags t
    JOIN post_tags pt ON pt.tag_id = t.id
    WHERE pt.post_id = ?
  `).all(post.id).map(t => t.name).join(',');

  db.prepare('UPDATE posts SET reading_time = ?, tags = ? WHERE id = ?')
    .run(readingTime, postTagNames, post.id);
}

// Add categories to projects (titles are JSON now, use LIKE)
db.prepare("UPDATE projects SET category = 'Web App' WHERE title LIKE '%E-Commerce%' OR title LIKE '%Task Management%' OR title LIKE '%Chat Application%'").run();
db.prepare("UPDATE projects SET category = 'Dashboard' WHERE title LIKE '%Weather%'").run();
db.prepare("UPDATE projects SET category = 'Developer Tool' WHERE title LIKE '%Portfolio Generator%' OR title LIKE '%API Gateway%'").run();

// Seed timeline entries
const insertTimeline = db.prepare(
  'INSERT INTO timeline (year, title, company, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
);
const timelineEntries = [
  ['2024', '{"en":"Senior Full-Stack Developer","de":"Senior Full-Stack Entwickler"}', '{"en":"Tech Corp","de":"Tech Corp"}', '{"en":"Leading development of microservices architecture and mentoring junior developers.","de":"Leitung der Microservices-Architektur und Mentoring von Junior-Entwicklern."}', 'briefcase', 0],
  ['2022', '{"en":"Full-Stack Developer","de":"Full-Stack Entwickler"}', '{"en":"StartupXYZ","de":"StartupXYZ"}', '{"en":"Built and shipped 3 major product features using React and Node.js.","de":"3 wichtige Produktfeatures mit React und Node.js entwickelt und ausgeliefert."}', 'briefcase', 0],
  ['2021', '{"en":"AWS Certified Developer","de":"AWS Zertifizierter Entwickler"}', '{"en":"Amazon Web Services","de":"Amazon Web Services"}', '{"en":"Earned professional cloud developer certification.","de":"Professionelle Cloud-Entwickler-Zertifizierung erworben."}', 'award', 0],
  ['2020', '{"en":"Computer Science Degree","de":"Informatik-Studium"}', '{"en":"University","de":"Universität"}', '{"en":"B.Sc. in Computer Science with focus on software engineering.","de":"B.Sc. Informatik mit Schwerpunkt Software Engineering."}', 'book', 0],
];
for (const t of timelineEntries) {
  insertTimeline.run(...t);
}

console.log('Database seeded successfully!');
console.log('Admin login: admin@portfolio.com / admin123');
