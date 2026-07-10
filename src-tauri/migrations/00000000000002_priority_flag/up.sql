ALTER TABLE clipboard_items ADD COLUMN priority_flag TEXT;
CREATE INDEX IF NOT EXISTS idx_clipboard_items_priority_flag ON clipboard_items(priority_flag);
