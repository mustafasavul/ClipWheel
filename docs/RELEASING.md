# Releasing ClipWheel

ClipWheel releases are built from `v*` tags and published as draft GitHub Releases first. Publish the draft only after the platform artifacts and updater metadata are verified.

## One-Time Setup

- Add `TAURI_SIGNING_PRIVATE_KEY` to GitHub Secrets. The current local private key was generated outside the repo at `~/.tauri/clipwheel.key`.
- Add `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` only if the private key is regenerated with a password.
- Keep the public key in `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`.
- Add Apple signing/notarization secrets when available: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_API_ISSUER`, `APPLE_API_KEY`, `APPLE_API_KEY_PATH`, `APPLE_TEAM_ID`.
- Add Windows signing secrets when available: `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`, or replace with the chosen trusted-signing provider.
- Create or update the separate Homebrew tap repo, expected as `mustafasavul/homebrew-tap`. Use `packaging/homebrew/Casks/clipwheel.rb` as the source template.

## Version Bump

1. Update the version in:
   - `package.json`
   - `src-tauri/Cargo.toml`
   - `src-tauri/tauri.conf.json`
   - `src/shared/version.ts`
   - `CHANGELOG.md`
2. Update the release date in `src/shared/version.ts` and `docs/VERSIONING.md`.
3. Run:

```bash
pnpm lint
pnpm typecheck
pnpm version:check
pnpm test
pnpm package:ci
```

## Publish Draft Release

1. Commit the release prep.
2. Tag the exact commit:

```bash
git tag v0.1.1
git push origin main --tags
```

3. Wait for `.github/workflows/release.yml`.
4. Verify the draft release contains:
   - macOS Apple Silicon DMG
   - macOS Intel DMG
   - Windows MSI
   - Windows NSIS setup executable
   - Linux AppImage
   - Linux deb
   - updater signatures
   - `latest.json`

## Artifact Smoke Test

- Install the package on each supported platform.
- Verify app launch, clipboard capture, settings persistence, and local SQLite migration.
- Verify the updater by installing the prior version, publishing an RC tag, checking for updates in Settings, installing, and confirming data remains intact.
- On Windows, confirm installation, first launch, autostart, and opening the GitHub link never show a console window.
- On macOS and Windows, document expected Gatekeeper or SmartScreen warnings until trusted signing is enabled.

## Homebrew Tap

1. Download the published macOS DMG URL and SHA256.
2. Update `Casks/clipwheel.rb` in `mustafasavul/homebrew-tap` from `packaging/homebrew/Casks/clipwheel.rb`.

3. Verify:

```bash
brew install --cask mustafasavul/tap/clipwheel
brew uninstall --cask clipwheel
```

## Rollback

- If a release is bad before publication, delete the draft release and tag, then retag a fixed commit.
- If a release is already public, publish a new patch version. Do not overwrite updater artifacts for a published version.
- Keep the updater private key stable. Losing it prevents existing installations from accepting future updates.
