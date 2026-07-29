# Agent Notes

Treat the refactored structure as an architecture contract, not a suggestion. Small, typed, scoped, readable.

## Ownership boundaries

- Keep Tauri/Rust OS access in `src-tauri/src`. No OS, filesystem, clipboard, database, tray, shortcut, or restore logic in the renderer.
- Keep renderer free of direct Node.js APIs. UI depends on typed app APIs, not desktop internals.
- Use `src/renderer/api/clipwheelClient.ts` for typed Tauri command/event additions, then consume from `src/renderer/data` or feature hooks.
- Prefer shared pure utilities in `src/shared` when behavior is cross-feature or worth testing independently.
- Keep feature components focused on feature behavior: reusable controls to `src/renderer/ui`, formatting to `src/renderer/presentation`, async/query logic to `src/renderer/data`.
- Prefer extending existing modules over parallel systems. A new abstraction must reduce real duplication or clarify a boundary.

## Styling

- Keep theme resolution in shared/renderer code (`src/shared/theme.ts`).
- Use semantic tokens from `src/renderer/styles/tokens.css` and feature-scoped CSS. No scattered hard-coded dark/light colors.
- Verify added controls stay responsive: list rows, filters, preview panes, smaller window layouts.

## Product constraints

- Do not add telemetry, analytics, cloud sync, accounts, or external services.
- Do not reintroduce content masking or image text extraction UI without an explicit product decision.
- Preserve local-first behavior and soft delete defaults. Destructive cleanup stays explicit.

## Before handoff

- Update tests in proportion to risk, especially for shared types, Tauri command contracts, query hooks, and user-facing flows.
- Run `pnpm lint && pnpm typecheck && pnpm version:check && pnpm test`, and document any command that could not be run.
