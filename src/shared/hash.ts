import { createHash } from 'node:crypto';

export function normalizeContent(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim();
}

export function hashContent(parts: Array<string | Buffer | null | undefined>): string {
  const hash = createHash('sha256');
  for (const part of parts) {
    if (part === null || part === undefined) continue;
    hash.update(part);
    hash.update('\0');
  }
  return hash.digest('hex');
}
