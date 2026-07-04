import os from 'node:os';
import path from 'node:path';
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
      sizeBytes: 11,
      contentHash: 'abc',
    });

    expect(repository.findByHash('abc')?.id).toBe(item.id);
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
});
