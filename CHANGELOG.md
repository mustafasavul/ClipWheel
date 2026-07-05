# Changelog

## 0.1.0 - 2026-07-06

- Migrated the app runtime from Electron to Tauri v2 with a Rust backend.
- Added Rust-owned SQLite access through Diesel migrations.
- Replaced preload IPC with a typed Tauri command/event client.
- Added local-first clipboard capture, restore, settings, cleanup, and media data-url commands.
- Removed legacy Electron runtime files, Forge config, and `better-sqlite3` usage.
- Added manual version tracking and release documentation.
