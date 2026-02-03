-- Pages table
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    slug_lower TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_name TEXT,
    recipient_name TEXT,
    template_id TEXT NOT NULL DEFAULT 'classic',
    edit_token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_pages_slug_lower ON pages(slug_lower);
CREATE INDEX IF NOT EXISTS idx_pages_edit_token ON pages(edit_token);

-- Reserved slugs table
CREATE TABLE IF NOT EXISTS reserved_slugs (
    slug_lower TEXT PRIMARY KEY,
    reason TEXT
);

-- Insert default reserved slugs
INSERT OR IGNORE INTO reserved_slugs (slug_lower, reason) VALUES
    ('admin', 'System reserved'),
    ('api', 'System reserved'),
    ('static', 'System reserved'),
    ('assets', 'System reserved'),
    ('create', 'System reserved'),
    ('edit', 'System reserved'),
    ('delete', 'System reserved'),
    ('login', 'System reserved'),
    ('logout', 'System reserved'),
    ('signup', 'System reserved'),
    ('settings', 'System reserved'),
    ('profile', 'System reserved'),
    ('dashboard', 'System reserved'),
    ('help', 'System reserved'),
    ('about', 'System reserved'),
    ('contact', 'System reserved'),
    ('terms', 'System reserved'),
    ('privacy', 'System reserved'),
    ('404', 'System reserved'),
    ('500', 'System reserved');

-- Creation logs for rate limiting
CREATE TABLE IF NOT EXISTS creation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT NOT NULL,
    page_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL
);

-- Index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_creation_logs_ip_hash ON creation_logs(ip_hash);
CREATE INDEX IF NOT EXISTS idx_creation_logs_created_at ON creation_logs(created_at);
