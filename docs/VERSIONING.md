# Versioning

ClipWheel uses semantic versioning: `MAJOR.MINOR.PATCH`.

Current versions:

- App version: `0.1.0`
- Package version: `0.1.0`
- Rust crate version: `0.1.0`
- Tauri bundle version: `0.1.0`
- Release date: `2026-07-06`
- Update mode: GitHub Releases `latest.json`

## Version Sources

Keep these files in sync for every release:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `src/shared/version.ts`
- `CHANGELOG.md`

Run this before building a release:

```bash
pnpm version:check
```

The sidebar app version shown in the renderer is sourced from `src/shared/version.ts`.

## Release Rules

- Patch version: bug fixes, small UI fixes, packaging fixes.
- Minor version: new features, migrations, clipboard behavior changes.
- Major version: breaking data migrations or major product behavior changes.

## Updates

ClipWheel uses Tauri updater artifacts published to GitHub Releases:

1. Build platform installers and updater bundles from a `v*` tag.
2. Sign updater artifacts with `TAURI_SIGNING_PRIVATE_KEY`.
3. Publish the draft GitHub Release after artifact verification.
4. Tauri Action publishes `latest.json` for the app updater.
5. The app checks GitHub Releases, downloads a signed update, installs it, and restarts.
6. The Rust repository opens and migrates the existing local SQLite database in place.

The updater uses GitHub Releases metadata only. ClipWheel still has no telemetry, accounts, cloud sync, or custom update server.

See `docs/RELEASING.md` for the release checklist and Homebrew tap update flow.
