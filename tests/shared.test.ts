import { describe, expect, it } from 'vitest';
import { matchesCleanupRequest } from '../src/shared/cleanupFilters';
import { detectClipboardType, detectCodeLanguage, isUrl } from '../src/shared/detection';
import { hashContent, normalizeContent } from '../src/shared/hash';
import { getSegmentIndex } from '../src/shared/radialGeometry';
import type { ClipboardItem } from '../src/shared/types';

describe('normalization and hashing', () => {
  it('normalizes trailing whitespace and line endings', () => {
    expect(normalizeContent(' hello \r\nworld  \n')).toBe('hello\nworld');
  });

  it('hashes normalized equivalent content consistently', () => {
    expect(hashContent([normalizeContent('a\r\n')])).toBe(hashContent([normalizeContent('a\n')]));
  });
});

describe('type detection', () => {
  it('detects URLs', () => {
    expect(isUrl('https://example.com/a')).toBe(true);
    expect(detectClipboardType({ text: 'www.example.com' }).type).toBe('url');
  });

  it('detects code languages', () => {
    expect(detectCodeLanguage('const value: string = "x";\nexport type Demo = { value: string }')).toBe('typescript');
    expect(detectCodeLanguage('{"ok": true}')).toBe('json');
    expect(detectCodeLanguage('def run():\n    print("ok")')).toBe('python');
  });

  it('detects terminal commands', () => {
    expect(detectClipboardType({ text: 'pnpm install' }).type).toBe('command');
  });
});

describe('cleanup filters', () => {
  const item: ClipboardItem = {
    id: '1',
    type: 'plain_text',
    title: 'a',
    previewText: 'a',
    contentText: 'a',
    contentHtml: null,
    contentRtf: null,
    imagePath: null,
    thumbnailPath: null,
    filePaths: [],
    url: null,
    codeLanguage: null,
    sourceApp: null,
    sizeBytes: 1,
    contentHash: 'hash',
    isPinned: true,
    isFavorite: false,
    isSensitive: false,
    isDeleted: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    lastUsedAt: null,
    deletedAt: null,
  };

  it('preserves pinned items unless explicitly included', () => {
    expect(matchesCleanupRequest(item, { mode: 'all' })).toBe(false);
    expect(matchesCleanupRequest(item, { mode: 'all', includePinned: true })).toBe(true);
  });
});

describe('radial wheel geometry', () => {
  it('maps cardinal directions to stable segment indices', () => {
    const center = { x: 100, y: 100 };
    expect(getSegmentIndex(center, { x: 100, y: 0 }, 8)).toBe(0);
    expect(getSegmentIndex(center, { x: 200, y: 100 }, 8)).toBe(2);
    expect(getSegmentIndex(center, { x: 100, y: 200 }, 8)).toBe(4);
  });
});
