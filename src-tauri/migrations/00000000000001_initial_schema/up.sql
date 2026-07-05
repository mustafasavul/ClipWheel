CREATE TABLE IF NOT EXISTS clipboard_items (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  preview_text TEXT NOT NULL,
  content_text TEXT,
  content_html TEXT,
  content_rtf TEXT,
  image_path TEXT,
  thumbnail_path TEXT,
  file_paths_json TEXT,
  formats_json TEXT,
  content_signals_json TEXT,
  url TEXT,
  code_language TEXT,
  source_app TEXT,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  content_hash TEXT NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  is_sensitive INTEGER NOT NULL DEFAULT 0,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_used_at TEXT,
  deleted_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clipboard_items_hash_live ON clipboard_items(content_hash) WHERE is_deleted = 0;
CREATE INDEX IF NOT EXISTS idx_clipboard_items_created ON clipboard_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clipboard_items_type ON clipboard_items(type);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clipboard_item_tags (
  clipboard_item_id TEXT NOT NULL REFERENCES clipboard_items(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (clipboard_item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS cleanup_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  action TEXT NOT NULL,
  criteria_json TEXT NOT NULL,
  deleted_count INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
