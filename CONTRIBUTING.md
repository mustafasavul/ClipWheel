# Contributing

## Setup

```bash
pnpm install
pnpm dev
```

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm version:check
pnpm test
pnpm build:renderer
cargo check --manifest-path src-tauri/Cargo.toml
```

## Pull Requests

- Keep Tauri/Rust OS access in `src-tauri/src`.
- Keep renderer code free of direct Node.js APIs.
- Use `src/renderer/api/clipwheelClient.ts` for typed Tauri command/event additions.
- Add tests for shared detection, cleanup, metadata, or repository behavior when changed.
- Document new settings in the README when they affect user behavior.
- Keep theme behavior centralized: resolve theme state through shared utilities and style surfaces through semantic CSS tokens instead of one-off hard-coded colors.
