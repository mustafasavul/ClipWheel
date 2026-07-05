import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { app, clipboard, nativeImage } from 'electron';
import { detectClipboardType, detectContentSignals, normalizeClipboardFormats } from '../shared/detection';
import { hashContent, normalizeContent } from '../shared/hash';
import type { ClipboardItem, ClipboardItemInput, Settings } from '../shared/types';
import type { ClipRepository } from './repository';

export class ClipboardService extends EventEmitter {
  private timer: NodeJS.Timeout | null = null;
  private lastHash = '';

  constructor(private readonly repository: ClipRepository) {
    super();
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.capture(), 750);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async capture(): Promise<ClipboardItem | null> {
    const settings = this.repository.getSettings();
    if (settings.pauseCapture) return null;

    const rawFormats = clipboard.availableFormats();
    const text = clipboard.readText();
    const html = clipboard.readHTML();
    const rtf = clipboard.readRTF();
    const image = clipboard.readImage();
    const hasImage = !image.isEmpty();
    const filePaths = settings.captureFiles ? detectFilePaths(text) : [];
    const formatInfo = normalizeClipboardFormats({
      rawFormats,
      hasText: Boolean(text),
      hasHtml: Boolean(html),
      hasRtf: Boolean(rtf),
      hasImage,
      hasFiles: filePaths.length > 0,
      platform: process.platform,
    });
    const normalizedText = normalizeContent(text);
    const hash = hashContent([normalizedText, html, rtf, hasImage ? image.toPNG() : null, filePaths.join('\n')]);
    if (hash === this.lastHash) return null;
    if (settings.ignoreDuplicates && this.repository.findByHash(hash)) {
      this.lastHash = hash;
      return null;
    }

    const typeInfo = detectClipboardType({ text, html, rtf, hasImage, filePaths });
    const contentSignals = detectContentSignals({ text, html, rtf, hasImage, filePaths, codeLanguage: typeInfo.codeLanguage });
    if (!shouldCaptureType(typeInfo.type, settings)) return null;

    const media = hasImage && settings.captureImages ? saveImageAssets(image, settings.maxImageSizeMb) : { imagePath: null, thumbnailPath: null, sizeBytes: Buffer.byteLength(text) };
    if (hasImage && !media.imagePath) return null;

    const input: ClipboardItemInput = {
      type: typeInfo.type,
      title: makeTitle(typeInfo.type, text, filePaths),
      previewText: makePreview(typeInfo.type, text, filePaths),
      contentText: hasImage ? null : text,
      contentHtml: settings.captureRichText ? html || null : null,
      contentRtf: settings.captureRichText ? rtf || null : null,
      imagePath: media.imagePath,
      thumbnailPath: media.thumbnailPath,
      filePaths,
      formatInfo,
      contentSignals,
      url: typeInfo.url,
      codeLanguage: typeInfo.codeLanguage,
      sourceApp: null,
      sizeBytes: media.sizeBytes,
      contentHash: hash,
    };

    const item = this.repository.createItem(input);
    this.lastHash = hash;
    this.emit('captured', item);
    return item;
  }

  restore(item: ClipboardItem): void {
    if (item.type === 'image' && item.imagePath && fs.existsSync(item.imagePath)) {
      clipboard.writeImage(nativeImage.createFromPath(item.imagePath));
    } else if (item.type === 'rich_text' && item.contentHtml) {
      clipboard.write({ html: item.contentHtml, text: item.contentText ?? item.previewText });
    } else if (item.type === 'file_reference') {
      clipboard.writeText(item.filePaths.join('\n'));
    } else {
      clipboard.writeText(item.contentText ?? item.url ?? item.previewText);
    }
    this.lastHash = item.contentHash;
    this.repository.markUsed(item.id);
    this.emit('restored', item);
  }
}

function shouldCaptureType(type: ClipboardItem['type'], settings: Settings): boolean {
  if (type === 'image') return settings.captureImages;
  if (type === 'file_reference') return settings.captureFiles;
  if (type === 'code' || type === 'command') return settings.captureCode;
  if (type === 'rich_text') return settings.captureRichText;
  return settings.capturePlainText;
}

function saveImageAssets(image: Electron.NativeImage, maxImageSizeMb: number): { imagePath: string | null; thumbnailPath: string | null; sizeBytes: number } {
  const png = image.toPNG();
  const sizeBytes = png.byteLength;
  if (sizeBytes > maxImageSizeMb * 1024 * 1024) return { imagePath: null, thumbnailPath: null, sizeBytes };
  const mediaDir = path.join(app.getPath('userData'), 'media');
  fs.mkdirSync(mediaDir, { recursive: true });
  const id = Date.now().toString(36);
  const imagePath = path.join(mediaDir, `${id}.png`);
  const thumbnailPath = path.join(mediaDir, `${id}-thumb.png`);
  fs.writeFileSync(imagePath, png);
  fs.writeFileSync(thumbnailPath, image.resize({ width: 360 }).toPNG());
  return { imagePath, thumbnailPath, sizeBytes };
}

function detectFilePaths(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^file:\/\//, ''))
    .filter((line) => line.startsWith('/') || /^[A-Za-z]:\\/.test(line))
    .filter((line) => fs.existsSync(line));
}

function makeTitle(type: ClipboardItem['type'], text: string, filePaths: string[]): string {
  if (type === 'image') return 'Screenshot or image';
  if (type === 'file_reference') return `${filePaths.length} file${filePaths.length === 1 ? '' : 's'}`;
  if (type === 'url') return safeSingleLine(text).replace(/^https?:\/\//, '').slice(0, 80);
  return safeSingleLine(text).slice(0, 80) || type.replace('_', ' ');
}

function makePreview(type: ClipboardItem['type'], text: string, filePaths: string[]): string {
  if (type === 'image') return 'Image captured locally';
  if (type === 'file_reference') return filePaths.join('\n');
  return text.slice(0, 600);
}

function safeSingleLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
