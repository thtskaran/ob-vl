



# Special Page Generator - Technical Specification

## Overview

A high-volume website generator allowing users to create custom shareable pages (e.g., Valentine's Day cards, birthday wishes, etc.) with custom slugs at `special.obvix.io/{slug}`.

---

## Architecture

### Monorepo Structure

```
special-pages/
├── apps/
│   ├── web/                    # Vite + React frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Creator.tsx      # Page creation form
│   │   │   │   └── Viewer.tsx       # Generated page viewer
│   │   │   ├── components/
│   │   │   │   ├── SlugChecker/
│   │   │   │   ├── TemplateSelector/
│   │   │   │   └── PreviewPane/
│   │   │   └── lib/
│   │   └── vite.config.ts
│   │
│   └── api/                    # Python FastAPI backend
│       ├── app/
│       │   ├── main.py
│       │   ├── routes/
│       │   │   ├── pages.py
│       │   │   └── slugs.py
│       │   ├── models/
│       │   ├── services/
│       │   │   └── slug_service.py
│       │   └── db/
│       │       ├── database.py
│       │       └── migrations/
│       └── requirements.txt
│
├── packages/
│   └── shared/                 # Shared types/constants
│       └── types.ts
│
├── data/                       # SQLite database
│   └── special.db
│
├── docker-compose.yml
├── turbo.json                  # Turborepo config
└── package.json
```

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Vite + React + TypeScript | Fast HMR, modern tooling |
| Backend | Python + FastAPI | Async, fast, simple |
| Database | SQLite (+ Litestream for backups) | Simple, performant, single-file |
| Caching | Redis (or in-memory for smaller scale) | Slug availability, rate limiting |
| CDN | Cloudflare (free tier) | Caching, DDoS protection |

---

## Database Schema

### SQLite Tables

```sql
-- Main pages table
CREATE TABLE pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    slug_lower TEXT UNIQUE NOT NULL,  -- For case-insensitive lookups

    -- Content
    title TEXT NOT NULL,
    message TEXT,
    sender_name TEXT,
    recipient_name TEXT,
    template_id TEXT DEFAULT 'default',

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,  -- Optional expiration
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,

    -- Indexes for performance
    CHECK(length(slug) >= 3 AND length(slug) <= 50)
);

CREATE INDEX idx_pages_slug_lower ON pages(slug_lower);
CREATE INDEX idx_pages_created_at ON pages(created_at DESC);
CREATE INDEX idx_pages_is_active ON pages(is_active) WHERE is_active = 1;

-- Reserved/blocked slugs
CREATE TABLE reserved_slugs (
    slug_lower TEXT PRIMARY KEY,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate limiting / abuse prevention
CREATE TABLE creation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT NOT NULL,           -- Hashed IP for privacy
    fingerprint_hash TEXT,           -- Browser fingerprint hash
    page_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL
);

CREATE INDEX idx_creation_logs_ip ON creation_logs(ip_hash, created_at);
```

---

## API Endpoints

### Slug Management

```
GET  /api/slugs/check/{slug}
     → { available: boolean, suggestions?: string[] }

GET  /api/slugs/suggest?base={name}
     → { suggestions: string[] }
```

### Page CRUD

```
POST /api/pages
     Body: { slug, title, message, sender_name, recipient_name, template_id }
     → { id, slug, edit_token }

GET  /api/pages/{slug}
     → { page data for viewing }

GET  /api/pages/{slug}/edit?token={edit_token}
     → { full page data for editing }

PATCH /api/pages/{slug}?token={edit_token}
     → { updated page }

DELETE /api/pages/{slug}?token={edit_token}
     → { success: boolean }
```

### Templates

```
GET  /api/templates
     → { templates: [...] }

GET  /api/templates/{id}
     → { template config }
```

---

## Scaling Strategy

### For High Volume (100k+ pages)

#### 1. Database Optimization

SQLite can handle 100k+ pages easily with proper indexing. Key optimizations:

```python
# Connection settings for high concurrency
PRAGMAS = {
    "journal_mode": "wal",        # Write-Ahead Logging
    "cache_size": -64000,         # 64MB cache
    "synchronous": "normal",      # Faster writes, still safe
    "temp_store": "memory",       # Temp tables in RAM
    "mmap_size": 268435456,       # 256MB memory-mapped I/O
}
```

**Why SQLite works:**
- Read-heavy workload (100:1 read:write ratio)
- Single-server deployment
- WAL mode handles concurrent reads during writes
- No network latency to DB

#### 2. Caching Layers

| Layer | TTL | Purpose |
|-------|-----|---------|
| Cloudflare Edge | 1 hour | Static assets, generated pages |
| Redis/Memory | 5 min | Page data, slug availability |
| Application | 1 min | Hot pages, templates |

```python
# Cache strategy
@cached(ttl=300, key="page:{slug}")
async def get_page(slug: str) -> Page:
    return await db.get_page(slug)

@cached(ttl=60, key="slug_available:{slug}")
async def check_slug(slug: str) -> bool:
    return await db.slug_available(slug)
```

#### 3. Rate Limiting

```python
# Redis-based rate limiting (or in-memory with sliding window)
RATE_LIMITS = {
    "page_creation": "10/hour/ip",
    "slug_check": "60/minute/ip",
}
```

#### 4. When to Scale Beyond Single VPS

**Stay on single VPS if:**
- < 500 concurrent users
- < 1M total pages
- < 100 writes/second

**Consider scaling to multi-server when:**
- Sustained > 1000 concurrent users
- Need geographic distribution
- Need zero-downtime deployments

**Scaling path:**
1. **Vertical first**: Upgrade VPS (more CPU/RAM)
2. **Add CDN caching**: Cloudflare handles most read traffic
3. **Separate concerns**: Move Redis to managed service
4. **Read replicas**: Litestream + read replicas if needed
5. **Full migration**: PostgreSQL + multiple app servers

---

## Design Requirements

### Visual Identity

**Theme:** Soft, romantic, cute Valentine's aesthetic
**Mood:** Warm, playful, heartfelt, whimsical

### Color Palette

```css
:root {
  /* Primary - Soft pinks */
  --pink-50: #fdf2f8;
  --pink-100: #fce7f3;
  --pink-200: #fbcfe8;
  --pink-300: #f9a8d4;
  --pink-400: #f472b6;
  --pink-500: #ec4899;

  /* Secondary - Warm reds */
  --rose-400: #fb7185;
  --rose-500: #f43f5e;
  --rose-600: #e11d48;

  /* Accent - Soft purples */
  --purple-200: #e9d5ff;
  --purple-300: #d8b4fe;
  --purple-400: #c084fc;

  /* Neutrals - Warm tones */
  --cream: #fffbf5;
  --warm-white: #fefcfb;
  --soft-gray: #9ca3af;
  --text-primary: #4a3728;
  --text-secondary: #78716c;

  /* Gradients */
  --gradient-romantic: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%);
  --gradient-sunset: linear-gradient(135deg, #fecdd3 0%, #fda4af 50%, #fb7185 100%);
  --gradient-dreamy: linear-gradient(135deg, #f5d0fe 0%, #e9d5ff 50%, #ddd6fe 100%);
}
```

### Typography

**Font Stack:**
```css
/* Headings - Playful, romantic script */
--font-display: 'Pacifico', 'Dancing Script', cursive;

/* Body - Soft, rounded sans-serif */
--font-body: 'Nunito', 'Quicksand', 'Poppins', sans-serif;

/* Accent - Handwritten feel */
--font-handwritten: 'Caveat', 'Kalam', cursive;
```

**Font Sizes:**
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 2rem;      /* 32px */
--text-4xl: 2.5rem;    /* 40px */
--text-hero: 3.5rem;   /* 56px */
```

### UI Elements

#### Buttons

```
┌─────────────────────────────────────────┐
│  Primary Button                         │
│  - Gradient background (pink → rose)    │
│  - Rounded corners (full pill shape)    │
│  - Soft shadow                          │
│  - Hover: scale up 1.05, glow effect    │
│  - Active: scale down 0.98              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Secondary Button                       │
│  - White/cream background               │
│  - Pink border                          │
│  - Hover: fill with soft pink           │
└─────────────────────────────────────────┘
```

```css
.btn-primary {
  background: linear-gradient(135deg, #f472b6, #f43f5e);
  color: white;
  border-radius: 9999px;
  padding: 12px 32px;
  font-family: var(--font-body);
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(244, 63, 94, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(244, 63, 94, 0.4);
}
```

#### Input Fields

```css
.input-field {
  background: var(--warm-white);
  border: 2px solid var(--pink-200);
  border-radius: 16px;
  padding: 14px 20px;
  font-family: var(--font-body);
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: var(--pink-400);
  box-shadow: 0 0 0 4px rgba(244, 114, 182, 0.15);
  outline: none;
}

.input-field::placeholder {
  color: var(--soft-gray);
  font-style: italic;
}
```

#### Cards

```css
.card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 10px 40px rgba(244, 114, 182, 0.1);
  border: 1px solid var(--pink-100);
}
```

### Decorative Elements

#### Floating Hearts

```
    ♥        Small hearts floating upward
  ♥   ♥      Random sizes (8px - 24px)
    ♥        Random opacity (0.3 - 0.8)
  ♥          Gentle swaying motion
      ♥      Infinite loop, staggered timing
```

```css
@keyframes float-heart {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) rotate(45deg);
    opacity: 0;
  }
}

.floating-heart {
  position: fixed;
  color: var(--pink-300);
  animation: float-heart 8s ease-in-out infinite;
  pointer-events: none;
}
```

#### Sparkles / Twinkles

```css
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: sparkle 1.5s ease-in-out infinite;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.8);
}
```

#### Confetti (on page creation success)

```typescript
// Use canvas-confetti library
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#f472b6', '#fb7185', '#c084fc', '#fda4af', '#f9a8d4']
});
```

### Animations

#### Page Transitions

```css
/* Fade + slide up */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: page-enter 0.4s ease-out;
}
```

#### Micro-interactions

```css
/* Heart pulse on hover */
@keyframes pulse-heart {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.heart-icon:hover {
  animation: pulse-heart 0.6s ease-in-out infinite;
  color: var(--rose-500);
}

/* Wiggle for attention */
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

/* Bounce for success */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

#### Loading States

```css
/* Bouncing hearts loader */
@keyframes bounce-loader {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.loader-hearts {
  display: flex;
  gap: 8px;
}

.loader-hearts span {
  width: 12px;
  height: 12px;
  background: var(--pink-400);
  border-radius: 50%;
  animation: bounce-loader 1.4s ease-in-out infinite;
}

.loader-hearts span:nth-child(2) { animation-delay: 0.16s; }
.loader-hearts span:nth-child(3) { animation-delay: 0.32s; }
```

### Page Layouts

#### Creator Page

```
┌─────────────────────────────────────────────────────────────┐
│  [Floating hearts background - subtle, 5-8 hearts]         │
│                                                             │
│     ┌─────────────────────────────────────────────────┐    │
│     │                                                  │    │
│     │           Create Something Special               │    │
│     │              (Pacifico font, pink)              │    │
│     │                                                  │    │
│     │     ┌───────────────────────────────────────┐   │    │
│     │     │                                        │   │    │
│     │     │         [Form Card - white]           │   │    │
│     │     │                                        │   │    │
│     │     │    To: [___________] sparkle icon     │   │    │
│     │     │                                        │   │    │
│     │     │    From: [___________] heart icon     │   │    │
│     │     │                                        │   │    │
│     │     │    Message:                           │   │    │
│     │     │    ┌─────────────────────────────┐    │   │    │
│     │     │    │                              │    │   │    │
│     │     │    │  (placeholder in italic)    │    │   │    │
│     │     │    │                              │    │   │    │
│     │     │    └─────────────────────────────┘    │   │    │
│     │     │                                        │   │    │
│     │     │         [  Create with Love  ]        │   │    │
│     │     │           (gradient button)           │   │    │
│     │     │                                        │   │    │
│     │     └───────────────────────────────────────┘   │    │
│     │                                                  │    │
│     └─────────────────────────────────────────────────┘    │
│                                                             │
│  [Decorative curved lines / swirls in corners]             │
└─────────────────────────────────────────────────────────────┘
```

#### Generated Page (Viewer)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Animated gradient background - slow shifting pinks]       │
│                                                             │
│     ┌─────────────────────────────────────────────────┐    │
│     │                                                  │    │
│     │              ♥  FOR YOU  ♥                       │    │
│     │           (Caveat handwritten font)             │    │
│     │                                                  │    │
│     │     ┌───────────────────────────────────────┐   │    │
│     │     │                                        │   │    │
│     │     │        Dear [Recipient Name],          │   │    │
│     │     │                                        │   │    │
│     │     │   [Message content in Nunito font]    │   │    │
│     │     │   [with gentle fade-in animation]     │   │    │
│     │     │                                        │   │    │
│     │     │            With love,                  │   │    │
│     │     │         [Sender Name] ♥               │   │    │
│     │     │                                        │   │    │
│     │     └───────────────────────────────────────┘   │    │
│     │                                                  │    │
│     │     [Sparkles appear around the card]           │    │
│     │                                                  │    │
│     └─────────────────────────────────────────────────┘    │
│                                                             │
│  [Create your own →] (small link at bottom)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Template Variations

| Template | Background | Accent | Special Element |
|----------|------------|--------|-----------------|
| Valentine | Soft pink gradient | Rose red | Floating hearts |
| Birthday | Warm cream + confetti | Purple/gold | Balloons animation |
| Thank You | Lavender gradient | Soft purple | Sparkles |
| Love Note | Parchment texture | Deep rose | Wax seal icon |
| Friendship | Peach gradient | Coral | Stars twinkle |

### Responsive Design

```css
/* Mobile-first breakpoints */
--breakpoint-sm: 640px;   /* Large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */

/* Mobile adjustments */
@media (max-width: 640px) {
  .card {
    border-radius: 20px;
    padding: 24px;
    margin: 16px;
  }

  .text-hero {
    font-size: 2.5rem;
  }

  /* Reduce floating hearts on mobile for performance */
  .floating-hearts-container {
    --heart-count: 4;
  }
}
```

### Accessibility

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .floating-heart,
  .sparkle,
  .confetti {
    animation: none;
  }

  .btn-primary:hover {
    transform: none;
  }

  * {
    transition-duration: 0.01ms !important;
  }
}

/* Focus states for keyboard navigation */
:focus-visible {
  outline: 3px solid var(--pink-400);
  outline-offset: 2px;
}

/* Sufficient color contrast */
.text-primary { /* 7:1 contrast on cream background */ }
```

### Assets Needed

**Icons (use Lucide or custom SVG):**
- Heart (filled, outline, broken)
- Sparkle / Star
- Gift
- Envelope (open, closed)
- Arrow right
- Check circle
- X circle

**Illustrations (optional - for empty states):**
- Cute bear/bunny holding heart
- Love letter with wings
- Heart-shaped balloon

**Sounds (optional - muted by default):**
- Soft "pop" on button click
- Gentle chime on success
- Paper unfold on page reveal

---

## Frontend Components

### Creator Page Flow

```
┌─────────────────────────────────────────────────────────┐
│                    STEP 1: Template                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │Valentine│  │Birthday │  │  Thank  │  │ Custom  │   │
│  │         │  │         │  │   You   │  │         │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    STEP 2: Content                      │
│                                                         │
│  To: [_____________]     From: [_____________]          │
│                                                         │
│  Title: [________________________________]              │
│                                                         │
│  Message:                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    STEP 3: Slug                         │
│                                                         │
│  special.obvix.io/ [for-my-love____]                   │
│                                                         │
│  ✓ Available!                                          │
│                                                         │
│  Suggestions: for-my-love-2024, my-valentine, ...      │
│                                                         │
│                    [Create Page →]                      │
└─────────────────────────────────────────────────────────┘
```

### Slug Checker Component

```typescript
interface SlugCheckerProps {
  value: string;
  onChange: (slug: string) => void;
  onValidityChange: (valid: boolean) => void;
}

// Behavior:
// - Debounced check (300ms)
// - Show loading state during check
// - Show availability with checkmark/x
// - Suggest alternatives if taken
// - Validate format: alphanumeric + hyphens, 3-50 chars
```

---

## Security Considerations

### Input Validation

```python
# Slug validation
SLUG_PATTERN = r'^[a-zA-Z0-9][a-zA-Z0-9-]{1,48}[a-zA-Z0-9]$'

# Reserved slugs (preload into reserved_slugs table)
RESERVED = [
    'api', 'admin', 'create', 'edit', 'delete', 'login',
    'signup', 'settings', 'help', 'about', 'terms', 'privacy',
    'static', 'assets', 'css', 'js', 'favicon',
]

# Content sanitization
- Strip HTML from text fields
- Limit message length (5000 chars)
- Limit title length (200 chars)
```

### Rate Limiting & Abuse Prevention

```python
# Per-IP limits
- 10 pages/hour
- 50 slug checks/minute

# Captcha trigger conditions
- > 3 pages in 10 minutes
- Suspicious patterns (sequential slugs)

# Content moderation (optional)
- Text profanity filter
```

---

## Deployment

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000

  api:
    build: ./apps/api
    ports:
      - "8000:8000"
    volumes:
      - ./apps/api:/app
      - ./data:/data
    environment:
      - APP_ENV=development
      - DATABASE_PATH=/data/special.db
      - REDIS_URL=redis://redis:6379
      - CACHE_BACKEND=redis
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Production (VPS)

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare                           │
│  - DNS: special.obvix.io                               │
│  - CDN: Cache static assets + pages                    │
│  - WAF: Bot protection, DDoS mitigation                │
│  - SSL: Full (strict) mode                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      VPS                                │
│  ┌────────────────────────────────────────────────┐    │
│  │                    Nginx                        │    │
│  │  - Reverse proxy to FastAPI (:8000)            │    │
│  │  - Serve static frontend build                 │    │
│  │  - Gzip compression                            │    │
│  └────────────────────────────────────────────────┘    │
│                          │                              │
│            ┌─────────────┼─────────────┐               │
│            ▼             ▼             ▼               │
│     ┌───────────┐ ┌───────────┐ ┌───────────┐         │
│     │  FastAPI  │ │  SQLite   │ │  Redis    │         │
│     │ (Gunicorn)│ │   (DB)    │ │ (Cache)   │         │
│     └───────────┘ └───────────┘ └───────────┘         │
└─────────────────────────────────────────────────────────┘
```

### VPS Directory Structure

```
/var/www/special/
├── apps/
│   ├── web/dist/           # Built frontend (served by Nginx)
│   └── api/                # FastAPI application
├── data/
│   └── special.db          # SQLite database
├── logs/
│   ├── nginx/
│   ├── api/
│   └── gunicorn/
├── backups/                # DB backups
└── .env                    # Environment variables
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name special.obvix.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name special.obvix.io;

    # SSL managed by Cloudflare origin cert
    ssl_certificate /etc/ssl/cloudflare/special.obvix.io.pem;
    ssl_certificate_key /etc/ssl/cloudflare/special.obvix.io.key;

    root /var/www/special/apps/web/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
    }

    # Static assets (long cache)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Systemd Service (API)

```ini
# /etc/systemd/system/special-api.service
[Unit]
Description=Special Pages API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/special/apps/api
Environment="PATH=/var/www/special/apps/api/venv/bin"
EnvironmentFile=/var/www/special/.env
ExecStart=/var/www/special/apps/api/venv/bin/gunicorn \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    -b 127.0.0.1:8000 \
    --access-logfile /var/www/special/logs/gunicorn/access.log \
    --error-logfile /var/www/special/logs/gunicorn/error.log \
    app.main:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

---

## VPS Requirements & Backup Strategy

### Minimum VPS Specs

| Scale | vCPU | RAM | Disk | Bandwidth |
|-------|------|-----|------|-----------|
| Small (10k pages) | 1 | 1GB | 10GB SSD | 500GB/mo |
| Medium (100k pages) | 2 | 2GB | 20GB SSD | 1TB/mo |
| Large (500k+ pages) | 2 | 4GB | 40GB SSD | 2TB/mo |

**Disk calculation:** ~2KB avg per page (text only) × pages + 20% overhead

### Backup Strategy

```bash
# /etc/cron.d/special-backup

# Database backup - every 6 hours
0 */6 * * * root sqlite3 /var/www/special/data/special.db ".backup '/var/www/special/backups/db/special-$(date +\%Y\%m\%d-\%H\%M).db'"

# Keep only last 7 days of DB backups
0 0 * * * root find /var/www/special/backups/db -mtime +7 -delete

# Remote backup (daily) - use rclone to any provider
0 2 * * * root rclone copy /var/www/special/backups/db remote:special-backups/db
```

### Disk Cleanup (Optional)

```python
# Cleanup job for expired pages
# Run daily via cron

async def cleanup_expired_pages():
    """Remove pages past expiration date."""
    await db.execute("""
        DELETE FROM pages
        WHERE expires_at IS NOT NULL
        AND expires_at < datetime('now')
    """)
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page load (viewer) | < 500ms (cached), < 1s (cold) |
| Slug check latency | < 100ms |
| Page creation | < 500ms |
| Concurrent viewers | 10,000+ |
| Pages stored | 1M+ |

---

## MVP Scope

### Phase 1 (MVP)
- [ ] Single template (Valentine's)
- [ ] Basic form (title, message, names)
- [ ] Slug selection with availability check
- [ ] Generated page viewer
- [ ] Basic rate limiting

### Phase 2
- [ ] Multiple templates
- [ ] Edit functionality with token
- [ ] Social sharing metadata (OG tags)
- [ ] View counter

### Phase 3
- [ ] Custom backgrounds/themes
- [ ] Music/audio attachment
- [ ] Animations/effects
- [ ] Analytics dashboard
- [ ] Expiration dates
- [ ] Password protection

---

## File: Environment Variables

```bash
# .env.example

# Application
APP_ENV=production
APP_URL=https://special.obvix.io
SECRET_KEY=your-secret-key-here

# Database
DATABASE_PATH=/var/www/special/data/special.db

# Redis (optional - can use in-memory for smaller scale)
REDIS_URL=redis://localhost:6379
# Set to "memory" to use in-memory cache instead of Redis
CACHE_BACKEND=redis

# Security
CORS_ORIGINS=https://special.obvix.io

# Rate Limiting
RATE_LIMIT_PAGES_PER_HOUR=10
RATE_LIMIT_CHECKS_PER_MINUTE=60

# Optional
SENTRY_DSN=
CAPTCHA_SITE_KEY=
CAPTCHA_SECRET_KEY=
```

---

## Questions to Resolve

1. **Authentication**: Should users be able to create accounts to manage their pages, or anonymous creation only?

2. **Expiration**: Should pages expire by default? If so, after how long?

3. **Moderation**: Manual review, AI moderation, or community reporting?

4. **Analytics**: Track view counts? Show to creator?

5. **Monetization**: Premium features? Ads? Donations?

6. **Themes**: How many templates at launch? User-customizable colors?
