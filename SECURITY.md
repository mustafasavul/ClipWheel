# Security Policy

ClipWheel stores clipboard data locally and intentionally avoids telemetry, analytics, cloud sync, accounts, and external services.

## Reporting A Vulnerability

Open a private security advisory or email the maintainer with reproduction steps, affected versions, and any relevant logs. Do not include real secrets or private clipboard data in reports.

## Clipboard Data

ClipWheel stores clipboard content as copied. It does not apply a masking layer or external classification. Type detection, metadata badges, QR generation, syntax highlighting, and preview rendering happen locally in the app. Do not include real secrets or private clipboard data in vulnerability reports.

Renderer code must stay free of direct Node.js APIs. Desktop OS access, clipboard polling, restore behavior, global shortcuts, tray integration, SQLite access, cleanup, and migrations belong in `src-tauri/src`.
