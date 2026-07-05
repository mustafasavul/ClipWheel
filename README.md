# ClipWheel

ClipWheel is a privacy-first desktop clipboard manager for macOS and Windows. It captures copied text, code, URLs, images, and file references locally, then lets you restore recent items through a GTA-style radial clipboard wheel or a full history window.

## Privacy Model

- Local-first storage only.
- SQLite database and image assets live in Electron's `userData` folder.
- No telemetry, analytics, accounts, cloud sync, or external services.
- Clipboard content is stored as copied; no cloud service, external classifier, or masking layer is applied.

## Current Features

- Radial wheel for recent captures with keyboard selection and Shift quicklook.
- Quicklook image previews for copied screenshots and images.
- Full history with search, type filters, date filters, scrolling, and pagination.
- Right-side preview panel for text, code, rich text, URLs, images, and file references.
- Item metadata including byte size, readable KB/MB size, text length, line count, file count, creation time, and last-used time.
- Local image asset storage with thumbnails.
- Text transformations, QR generation, pinning, favorites, and soft delete cleanup.

## Supported Clipboard Types

- Plain text
- Rich text / HTML / RTF when available
- Images and screenshots
- File and folder path references
- URLs
- Code snippets with simple language detection
- Command and terminal snippets

## Development

```bash
pnpm install
pnpm dev
```

The renderer uses React and Vite. Electron main owns OS APIs, global shortcuts, tray, clipboard polling, SQLite, cleanup, and restore-to-clipboard behavior. Renderer code talks to main through a typed preload bridge with `contextIsolation: true` and `nodeIntegration: false`.

## Build

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm make
```

Electron Forge is configured for macOS DMG/ZIP and Windows Squirrel installer outputs. CI runs install, lint, typecheck, test, make, and uploads build artifacts. Tag pushes matching `v*` are prepared for release builds.

## Shortcuts

- macOS: `Cmd+Shift+V`
- Windows: `Ctrl+Shift+V`
- Wheel selection: number keys `1-8` or `Enter`
- Close wheel: `Escape`

## Roadmap

- Signed and notarized release builds
- Configurable global shortcut recording
- Native file clipboard restore
- Import/export for local backups
- More syntax languages and preview types

## Known Limitations

- Auto paste is present as a setting but disabled by default and not simulated yet.
- File references initially restore as text paths.
- Source app detection is a placeholder because cross-platform active-app APIs differ.
- The first public builds are unsigned. macOS Gatekeeper and Windows SmartScreen may warn until signing is configured.
