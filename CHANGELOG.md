# Changelog

## 0.3.0 - 2026-07-30

- Added a Content Security Policy to the webview, which previously ran with `csp: null` and no restriction on outbound requests. `connect-src` is now limited to the app itself and the Tauri IPC channel, so no renderer code path can reach the network.
- Fixed rich-text previews loading remote images. A tracking pixel inside copied HTML would fetch on preview, revealing that the item had been viewed; `img-src` is now restricted to the app and `data:` URLs.
- Added a separate development CSP so the Vite dev server and HMR socket keep working without weakening the shipped policy.
- Added translated README files for Arabic, Chinese, French, German, Hindi, Italian, Russian, and Turkish.

## 0.2.0 - 2026-07-29

- Redesigned both surfaces around a flat, token-driven visual system: hairline-separated history rows replace floating glass cards, and depth is reserved for elements that genuinely float.
- Reduced backdrop blur to the wheel overlay, popovers, and the confirm dialog, removing six stacked blur layers from the history window.
- Added spacing, radius, type, weight, and motion scales as named tokens; removed the ad-hoc values and dead tokens they replaced.
- Added Space Grotesk as the display face for headings, the brand mark, and the wheel centre, bundled locally with no network fetch at runtime.
- Reserved the accent colour for state (selection, active navigation, focus), leaving one accent-filled control per view.
- Added a `prefers-reduced-motion` block and removed the staggered history row animation.
- Fixed the focus ring, which was drawn at 46% alpha and fell below the 3:1 contrast floor.
- Changed history row actions to stay visible instead of appearing on hover, which hid them from keyboard users.
- Removed the Purge Deleted cleanup action; soft-deleted captures are now removed individually from Trash.
- Fixed 22 locales that were missing the Trash feature strings and fell back to English.
- Localized the tray menu, capture-generated titles, wheel appearance preset names, and item update errors, which were previously hard-coded English.
- Added a `set_locale_strings` command so native surfaces follow the app language without duplicating the message catalogue in Rust.
- Added a release guard that fails the build when the pushed tag does not match the app version.
- Changed release notes to come from this changelog, so the in-app updater shows what actually changed.

## 0.1.1 - 2026-07-21

- Prevented the release application from opening a console window on Windows.
- Removed the Windows `cmd.exe` hop when opening the project URL.

## 0.1.0 - 2026-07-06

- Migrated the app runtime from Electron to Tauri v2 with a Rust backend.
- Added Rust-owned SQLite access through Diesel migrations.
- Replaced preload IPC with a typed Tauri command/event client.
- Added local-first clipboard capture, restore, settings, cleanup, and media data-url commands.
- Added system-aware dark and light theme support with semantic CSS tokens.
- Added a modernized Settings UI with icon-backed controls, Title Case labels, and sidebar app version display.
- Changed the default theme to `system` for new settings records in both renderer defaults and Rust defaults.
- Removed legacy Electron runtime files, Forge config, and `better-sqlite3` usage.
- Added manual version tracking and release documentation.
- Added GitHub Release packaging, Tauri updater configuration, in-app update controls, and Homebrew tap documentation.
