import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { app } from 'electron';
import { defaultSettings } from '../shared/settings';
import type { CleanupJob, CleanupRequest, ClipboardItem, ClipboardItemInput, HistoryQuery, Settings } from '../shared/types';

interface ClipboardRow {
  id: string;
  type: ClipboardItem['type'];
  title: string;
  preview_text: string;
  content_text: string | null;
  content_html: string | null;
  content_rtf: string | null;
  image_path: string | null;
  thumbnail_path: string | null;
  file_paths_json: string | null;
  url: string | null;
  code_language: ClipboardItem['codeLanguage'];
  source_app: string | null;
  size_bytes: number;
  content_hash: string;
  is_pinned: 0 | 1;
  is_favorite: 0 | 1;
  is_sensitive: 0 | 1;
  is_deleted: 0 | 1;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  deleted_at: string | null;
}

export class ClipRepository {
  private readonly db: Database.Database;

  constructor(dbPath = path.join(app.getPath('userData'), 'clipwheel.sqlite')) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.migrate();
    this.seedSettings();
  }

  createItem(input: ClipboardItemInput): ClipboardItem {
    const now = new Date().toISOString();
    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO clipboard_items (
          id, type, title, preview_text, content_text, content_html, content_rtf, image_path,
          thumbnail_path, file_paths_json, url, code_language, source_app, size_bytes, content_hash,
          is_pinned, is_favorite, is_sensitive, is_deleted, created_at, updated_at
        ) VALUES (
          @id, @type, @title, @previewText, @contentText, @contentHtml, @contentRtf, @imagePath,
          @thumbnailPath, @filePathsJson, @url, @codeLanguage, @sourceApp, @sizeBytes, @contentHash,
          0, 0, 0, 0, @createdAt, @updatedAt
        )`,
      )
      .run({
        id,
        type: input.type,
        title: input.title,
        previewText: input.previewText,
        contentText: input.contentText ?? null,
        contentHtml: input.contentHtml ?? null,
        contentRtf: input.contentRtf ?? null,
        imagePath: input.imagePath ?? null,
        thumbnailPath: input.thumbnailPath ?? null,
        filePathsJson: JSON.stringify(input.filePaths ?? []),
        url: input.url ?? null,
        codeLanguage: input.codeLanguage ?? null,
        sourceApp: input.sourceApp ?? null,
        sizeBytes: input.sizeBytes,
        contentHash: input.contentHash,
        createdAt: now,
        updatedAt: now,
      });
    return this.getItem(id);
  }

  getItem(id: string): ClipboardItem {
    const row = this.db.prepare('SELECT * FROM clipboard_items WHERE id = ?').get(id) as ClipboardRow | undefined;
    if (!row) throw new Error(`Clipboard item not found: ${id}`);
    return rowToItem(row);
  }

  findByHash(hash: string): ClipboardItem | null {
    const row = this.db.prepare('SELECT * FROM clipboard_items WHERE content_hash = ? AND is_deleted = 0 LIMIT 1').get(hash) as ClipboardRow | undefined;
    return row ? rowToItem(row) : null;
  }

  listItems(query: HistoryQuery = {}): ClipboardItem[] {
    const { where, params } = this.buildHistoryWhere(query);
    params.limit = query.limit ?? 500;
    params.offset = query.offset ?? 0;
    const rows = this.db.prepare(`SELECT * FROM clipboard_items ${where} ORDER BY is_pinned DESC, created_at DESC LIMIT @limit OFFSET @offset`).all(params) as ClipboardRow[];
    return rows.map(rowToItem);
  }

  countItems(query: HistoryQuery = {}): number {
    const { where, params } = this.buildHistoryWhere(query);
    const row = this.db.prepare(`SELECT COUNT(*) as count FROM clipboard_items ${where}`).get(params) as { count: number };
    return row.count;
  }

  updateFlags(id: string, flags: Partial<Pick<ClipboardItem, 'isPinned' | 'isFavorite'>>): ClipboardItem {
    const current = this.getItem(id);
    this.db
      .prepare('UPDATE clipboard_items SET is_pinned = ?, is_favorite = ?, updated_at = ? WHERE id = ?')
      .run(flags.isPinned ?? current.isPinned ? 1 : 0, flags.isFavorite ?? current.isFavorite ? 1 : 0, new Date().toISOString(), id);
    return this.getItem(id);
  }

  softDelete(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE clipboard_items SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, id);
  }

  markUsed(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE clipboard_items SET last_used_at = ?, updated_at = ? WHERE id = ?').run(now, now, id);
  }

  cleanup(request: CleanupRequest): CleanupJob {
    const now = new Date().toISOString();
    const params: Record<string, string | number> = { now };
    let where = 'is_deleted = 0';
    if (!request.includePinned) where += ' AND is_pinned = 0';
    if (request.mode === 'unpinned') where += ' AND is_pinned = 0';
    if (request.mode === 'older_than' && request.olderThan) {
      where += ' AND created_at < @olderThan';
      params.olderThan = request.olderThan;
    }
    if (request.mode === 'between' && request.startDate && request.endDate) {
      where += ' AND created_at BETWEEN @startDate AND @endDate';
      params.startDate = request.startDate;
      params.endDate = request.endDate;
    }
    if (request.mode === 'type' && request.type) {
      where += ' AND type = @type';
      params.type = request.type;
    }
    let deletedCount = 0;
    if (request.mode === 'purge_deleted') {
      deletedCount = this.db.prepare('DELETE FROM clipboard_items WHERE is_deleted = 1').run().changes;
    } else {
      deletedCount = this.db.prepare(`UPDATE clipboard_items SET is_deleted = 1, deleted_at = @now, updated_at = @now WHERE ${where}`).run(params).changes;
    }
    const id = randomUUID();
    const action = request.mode;
    const criteriaJson = JSON.stringify(request);
    this.db.prepare('INSERT INTO cleanup_jobs (id, action, criteria_json, deleted_count, created_at) VALUES (?, ?, ?, ?, ?)').run(id, action, criteriaJson, deletedCount, now);
    return { id, action, criteriaJson, deletedCount, createdAt: now };
  }

  getSettings(): Settings {
    const rows = this.db.prepare('SELECT key, value_json FROM settings').all() as Array<{ key: keyof Settings; value_json: string }>;
    const settings: Settings = { ...defaultSettings };
    for (const row of rows) {
      settings[row.key] = JSON.parse(row.value_json) as never;
    }
    return settings;
  }

  updateSettings(patch: Partial<Settings>): Settings {
    const now = new Date().toISOString();
    const statement = this.db.prepare('INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at');
    for (const [key, value] of Object.entries(patch)) {
      statement.run(key, JSON.stringify(value), now);
    }
    return this.getSettings();
  }

  close(): void {
    this.db.close();
  }

  private seedSettings(): void {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
    if (count.count > 0) return;
    this.updateSettings(defaultSettings);
  }

  private buildHistoryWhere(query: HistoryQuery): { where: string; params: Record<string, string | number> } {
    const clauses: string[] = [];
    const params: Record<string, string | number> = {};
    if (!query.includeDeleted) clauses.push('is_deleted = 0');
    if (query.type && query.type !== 'all') {
      clauses.push('type = @type');
      params.type = query.type;
    }
    if (query.search?.trim()) {
      clauses.push('(title LIKE @search OR preview_text LIKE @search OR content_text LIKE @search OR url LIKE @search)');
      params.search = `%${query.search.trim()}%`;
    }
    const now = new Date();
    if (query.dateFilter === 'today') {
      clauses.push('created_at >= @startDate');
      params.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (query.dateFilter === 'last7' || query.dateFilter === 'last30') {
      const days = query.dateFilter === 'last7' ? 7 : 30;
      params.startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
      clauses.push('created_at >= @startDate');
    } else if (query.dateFilter === 'custom') {
      if (query.startDate) {
        clauses.push('created_at >= @startDate');
        params.startDate = query.startDate;
      }
      if (query.endDate) {
        clauses.push('created_at <= @endDate');
        params.endDate = query.endDate;
      }
    }
    return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clipboard_items (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        preview_text TEXT NOT NULL,
        content_text TEXT,
        content_html TEXT,
        content_rtf TEXT,
        image_path TEXT,
        thumbnail_path TEXT,
        file_paths_json TEXT,
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
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
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
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        criteria_json TEXT NOT NULL,
        deleted_count INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    const now = new Date().toISOString();
    this.db.prepare("UPDATE clipboard_items SET is_deleted = 1, deleted_at = COALESCE(deleted_at, ?), updated_at = ? WHERE is_deleted = 0 AND (type = 'sensitive' OR is_sensitive = 1)").run(now, now);
  }
}

function rowToItem(row: ClipboardRow): ClipboardItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    previewText: row.preview_text,
    contentText: row.content_text,
    contentHtml: row.content_html,
    contentRtf: row.content_rtf,
    imagePath: row.image_path,
    thumbnailPath: row.thumbnail_path,
    filePaths: row.file_paths_json ? (JSON.parse(row.file_paths_json) as string[]) : [],
    url: row.url,
    codeLanguage: row.code_language,
    sourceApp: row.source_app,
    sizeBytes: row.size_bytes,
    contentHash: row.content_hash,
    isPinned: Boolean(row.is_pinned),
    isFavorite: Boolean(row.is_favorite),
    isDeleted: Boolean(row.is_deleted),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at,
    deletedAt: row.deleted_at,
  };
}
