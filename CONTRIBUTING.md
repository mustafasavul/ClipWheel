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
pnpm test
```

## Pull Requests

- Keep main-process OS access out of the renderer.
- Add tests for shared detection, privacy, cleanup, or repository behavior when changed.
- Document new settings in the README when they affect user behavior.
