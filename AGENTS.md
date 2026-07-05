# Agent Notes

- Keep Electron OS access in `src/main`.
- Keep renderer free of direct Node.js APIs.
- Use `src/preload/index.ts` for typed IPC additions.
- Prefer shared pure utilities in `src/shared` when behavior needs tests.
- Do not add telemetry, analytics, cloud sync, accounts, or external services.
- Do not reintroduce content masking or image text extraction UI without an explicit product decision.
- Preserve local-first behavior and soft delete defaults.
