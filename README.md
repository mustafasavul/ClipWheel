# ClipWheel

ClipWheel is a privacy-first desktop clipboard manager for macOS and Windows. It captures copied text, code, URLs, images, and file references locally, then lets you restore recent items through a GTA-style radial clipboard wheel or a full history window.

## Privacy Model

- Local-first storage only.
- SQLite database and image assets live in the local Tauri app data folder.
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

The renderer uses React and Vite. Tauri/Rust owns OS APIs, global shortcuts, tray behavior, clipboard polling, SQLite, cleanup, and restore-to-clipboard behavior. Renderer code talks to Rust through the typed Tauri client in `src/renderer/api/clipwheelClient.ts`.

## Build

```bash
pnpm lint
pnpm typecheck
pnpm version:check
pnpm test
pnpm tauri build
```

Tauri is configured for local desktop bundle outputs. CI should run install, lint, typecheck, version check, test, and Tauri build before publishing artifacts.

## Versioning

Current app version: `0.1.0`

Version sources are kept in sync across `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, and `src/shared/version.ts`.

```bash
pnpm version:check
```

Updates are manual local release installs for now. ClipWheel does not use an external auto-update service, telemetry, accounts, or cloud checks.

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
