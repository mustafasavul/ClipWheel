# Changelog

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
