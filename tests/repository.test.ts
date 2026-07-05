import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getPath: () => os.tmpdir(),
  },
}));

describe('ClipRepository', () => {
  let dbPath: string;

  beforeEach(() => {
    dbPath = path.join(os.tmpdir(), `clipwheel-${Date.now()}-${Math.random()}.sqlite`);
  });

  it('creates, lists, updates, and soft deletes items', async () => {
    const { ClipRepository } = await import('../src/main/repository');
    const repository = new ClipRepository(dbPath);
    const item = repository.createItem({
      type: 'plain_text',
      title: 'Hello',
      previewText: 'Hello world',
      contentText: 'Hello world',
      formatInfo: {
        rawFormats: ['text/plain'],
        normalizedFormats: ['text/plain'],
        hasText: true,
        hasHtml: false,
        hasRtf: false,
        hasImage: false,
        hasFiles: false,
        platform: 'linux',
      },
      contentSignals: [{ kind: 'markdown', confidence: 'medium' }],
      sizeBytes: 11,
      contentHash: 'abc',
    });

    expect(repository.findByHash('abc')?.id).toBe(item.id);
    expect(item.formatInfo.hasText).toBe(true);
    expect(item.contentSignals[0]?.kind).toBe('markdown');
    expect(repository.listItems({ search: 'world' })).toHaveLength(1);
    expect(repository.updateFlags(item.id, { isPinned: true }).isPinned).toBe(true);
    repository.softDelete(item.id);
    expect(repository.listItems()).toHaveLength(0);
    expect(repository.listItems({ includeDeleted: true })).toHaveLength(1);
    repository.close();
  });

  it('persists settings and logs cleanup jobs', async () => {
    const { ClipRepository } = await import('../src/main/repository');
    const repository = new ClipRepository(dbPath);
    expect(repository.updateSettings({ pauseCapture: true }).pauseCapture).toBe(true);
    repository.createItem({
      type: 'url',
      title: 'example.com',
      previewText: 'https://example.com',
      contentText: 'https://example.com',
      url: 'https://example.com',
      sizeBytes: 19,
      contentHash: 'url-hash',
    });
    const job = repository.cleanup({ mode: 'type', type: 'url' });
    expect(job.deletedCount).toBe(1);
    repository.close();
  });

  it('migrates old rows without clipboard metadata to safe defaults', async () => {
    const db = new Database(dbPath);
    db.exec(`
      CREATE TABLE clipboard_items (
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
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO clipboard_items (
        id, type, title, preview_text, content_text, file_paths_json, size_bytes, content_hash,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('old', 'plain_text', 'Old', 'Old text', 'Old text', '[]', 8, 'old-hash', now, now);
    db.close();

    const { ClipRepository } = await import('../src/main/repository');
    const repository = new ClipRepository(dbPath);
    const item = repository.getItem('old');
    expect(item.formatInfo).toMatchObject({ rawFormats: [], normalizedFormats: [], platform: 'unknown' });
    expect(item.contentSignals).toEqual([]);
    repository.close();
  });
});
