# Agent Notes

- Keep Tauri/Rust OS access in `src-tauri/src`.
- Keep renderer free of direct Node.js APIs.
- Use `src/renderer/api/clipwheelClient.ts` for typed Tauri command/event additions.
- Prefer shared pure utilities in `src/shared` when behavior needs tests.
- Keep theme resolution in shared/renderer code and style theme differences through semantic CSS tokens, not scattered hard-coded colors.
- Do not add telemetry, analytics, cloud sync, accounts, or external services.
- Do not reintroduce content masking or image text extraction UI without an explicit product decision.
- Preserve local-first behavior and soft delete defaults.
