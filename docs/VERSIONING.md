# Versioning

ClipWheel uses semantic versioning: `MAJOR.MINOR.PATCH`.

Current versions:

- App version: `0.1.0`
- Package version: `0.1.0`
- Rust crate version: `0.1.0`
- Tauri bundle version: `0.1.0`
- Update mode: manual local release install

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

## Release Rules

- Patch version: bug fixes, small UI fixes, packaging fixes.
- Minor version: new features, migrations, clipboard behavior changes.
- Major version: breaking data migrations or major product behavior changes.

## Updates

ClipWheel does not use an external auto-update service yet. Updates are manual:

1. Build a signed release artifact.
2. Publish the `.dmg` or platform bundle through the chosen release channel.
3. User installs the newer version over the existing app.
4. The Rust repository opens and migrates the existing local SQLite database in place.

No telemetry, accounts, cloud sync, or external update checks are part of the current version system.
