# ClipWheel

ClipWheel is a privacy-first desktop clipboard manager for macOS, Windows, and Linux. It captures copied text, code, URLs, images, and file references locally, then lets you restore recent items through a radial clipboard wheel or a full history window.

## Privacy Model

- Local-first storage only.
- SQLite database and image assets live in the local Tauri app data folder.
- No telemetry, analytics, accounts, cloud sync, or external services.
- The updater only checks the public GitHub Releases metadata URL configured in the app.
- Clipboard content is stored as copied; no cloud service, external classifier, or masking layer is applied.

## Current Features

- Radial wheel for recent captures with keyboard selection and Shift quicklook.
- Quicklook image previews for copied screenshots and images.
- Full history with search, type filters, date filters, scrolling, and pagination.
- Right-side preview panel for text, code, rich text, URLs, images, and file references.
- Item metadata including byte size, readable KB/MB size, text length, line count, file count, creation time, and last-used time.
- Local image asset storage with thumbnails.
- Text transformations, pinning, favorites, and soft delete cleanup.
- System, dark, and light theme support. New installs default to the operating system theme, and users can override the theme in Settings.
- Modern Settings UI with icon-backed controls and the app version shown in the sidebar footer.

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

Theme resolution is renderer-owned and testable through shared utilities in `src/shared/theme.ts`. The CSS theme system uses semantic tokens in `src/renderer/styles/app.css`; avoid hard-coded one-off dark or light colors when adding UI.

## Project Structure

ClipWheel was refactored into clear ownership boundaries so future work stays maintainable instead of collecting one-off UI and platform code in the same files.

- `src-tauri/src`: Rust-owned desktop behavior, including OS APIs, clipboard access, tray, shortcuts, SQLite persistence, cleanup, and Tauri commands.
- `src/shared`: pure TypeScript domain types, constants, i18n bundles, and utilities that can be tested without React or Tauri.
- `src/renderer/api`: typed Tauri command and event boundary. Renderer features must call desktop behavior through `clipwheelClient.ts`.
- `src/renderer/data`: async state, React Query hooks, cache invalidation, and app API provider wiring.
- `src/renderer/features`: feature-level React surfaces such as history, preview, wheel, and settings.
- `src/renderer/presentation`: formatting and display helpers that are not tied to a specific component tree.
- `src/renderer/ui`: reusable, small UI primitives shared across features.
- `src/renderer/styles`: semantic tokens, layout CSS, feature CSS, and responsive rules.

## Agent Architecture Rules

Agents working on this repository must treat the refactored structure as a product architecture contract, not a suggestion. Write code as a senior architect would: small, typed, scoped, readable, and easy to maintain after the task is finished.

- Respect ownership boundaries. Do not put OS, filesystem, clipboard, database, tray, shortcut, or restore logic in the renderer. That work belongs in `src-tauri/src`.
- Keep the renderer free of direct Node.js APIs. UI code should depend on typed app APIs, not desktop internals.
- Add or change Tauri commands through `src/renderer/api/clipwheelClient.ts`, then consume them from `src/renderer/data` or feature hooks.
- Keep shared behavior in `src/shared` when it is pure, cross-feature, or worth testing independently.
- Keep feature components focused on feature behavior. Move reusable controls to `src/renderer/ui`, formatting to `src/renderer/presentation`, and async/query logic to `src/renderer/data`.
- Prefer extending existing modules over creating parallel systems. A new abstraction should reduce real duplication or clarify an existing boundary.
- Use semantic CSS tokens from `src/renderer/styles/tokens.css` and feature-scoped CSS files. Avoid scattered hard-coded theme colors.
- Preserve local-first behavior. Do not add telemetry, analytics, cloud sync, accounts, external services, content masking, or image text extraction unless there is an explicit product decision.
- Preserve soft-delete defaults and data safety. Destructive cleanup must stay explicit.
- Keep UI changes responsive and verify that added controls do not break list rows, filters, preview panes, or smaller window layouts.
- Update tests in proportion to the risk of the change, especially when touching shared types, Tauri command contracts, query hooks, or user-facing flows.
- Before handing off, run the relevant validation commands and document any command that could not be run.

## Tech Stack

- Desktop runtime: Tauri v2
- Native backend: Rust
- Database: SQLite with Diesel ORM and Diesel migrations
- Frontend: React 19, TypeScript, Vite
- Server state / async state: TanStack React Query
- Desktop API bridge: `@tauri-apps/api` through `src/renderer/api/clipwheelClient.ts`
- UI icons: `lucide-react`
- Code highlighting: `highlight.js`
- HTML sanitization: `sanitize-html`
- Testing: Vitest
- Linting and type checks: ESLint, TypeScript
- Packaging: Tauri CLI

## Build

```bash
pnpm lint
pnpm typecheck
pnpm version:check
pnpm test
pnpm tauri build
```

Tauri is configured for local desktop bundle outputs and updater artifacts. Release builds require `TAURI_SIGNING_PRIVATE_KEY` and optionally `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. CI smoke packaging uses `pnpm package:ci` so pull requests can build without release signing secrets.

## Installers

GitHub Releases provide draft-reviewed desktop installers for each public version:

| Asset | Platform |
| --- | --- |
| `ClipWheel_VERSION_aarch64.dmg` | macOS Apple Silicon |
| `ClipWheel_VERSION_x64.dmg` | macOS Intel |
| `ClipWheel_VERSION_x64_en-US.msi` | Windows x64 MSI |
| `ClipWheel_VERSION_x64-setup.exe` | Windows x64 NSIS installer |
| `ClipWheel_VERSION_amd64.AppImage` | Linux universal AppImage |
| `ClipWheel_VERSION_amd64.deb` | Debian/Ubuntu |

Homebrew uses a custom tap:

```bash
brew install --cask mustafasavul/tap/clipwheel
```

## Versioning

Current app version: `0.1.1`

Version sources are kept in sync across `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, and `src/shared/version.ts`.

```bash
pnpm version:check
```

ClipWheel checks `https://github.com/mustafasavul/ClipWheel/releases/latest/download/latest.json` for signed release updates. It does not use telemetry, accounts, cloud sync, or a custom update server.

## Shortcuts

- macOS: `Cmd+Shift+V`
- Windows: `Ctrl+Shift+V`
- Wheel selection: number keys `1-8` or `Enter`
- Close wheel: `Escape`

## Settings

- Theme: `System`, `Dark`, or `Light`. `System` follows the current operating system color scheme.
- Wheel position: center of the screen or cursor position.
- Capture controls for plain text, rich text, images, file references, code, and duplicate handling.
- Privacy controls for pause capture, ignored source apps, and clear-on-quit behavior.
- Cleanup actions use soft delete by default, with explicit purge for deleted records.
- Update controls for checking GitHub Releases and installing signed updates in place.

## Roadmap

- Apple notarized and Windows trusted release builds
- Configurable global shortcut recording
- Native file clipboard restore
- Import/export for local backups
- More syntax languages and preview types

## Known Limitations

- Auto paste is present as a setting but disabled by default and not simulated yet.
- File references initially restore as text paths.
- Source app detection is a placeholder because cross-platform active-app APIs differ.
- Existing installs that already saved `dark` or `light` keep that user choice. New default settings use `system`.
- The first public OS installers may be unsigned or ad-hoc signed. macOS Gatekeeper and Windows SmartScreen may warn until Apple notarization and Windows trusted signing are configured.
