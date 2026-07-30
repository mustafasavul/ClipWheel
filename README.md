<div align="center">

<img src="assets/brand/clipwheel-logo-transparent.png" alt="ClipWheel logo" width="128" />

<img src="docs/media/whell.gif" alt="ClipWheel Action" width="600" />

# ClipWheel — The Unique Radial Clipboard Manager

**Stop scrolling through clipboard history lists. Discover the fastest way to access your clipboard with a pie menu interface. Press one shortcut, flick to the slice you want, paste.**

ClipWheel is a free, open-source, privacy-first clipboard manager for **macOS, Windows, and Linux** — featuring a stunning radial wheel (also known as a circular menu, marking menu, or hotbox) that puts your last 4–12 copies just one gesture away, with zero data ever leaving your machine.

[![Release](https://img.shields.io/github/v/release/mustafasavul/ClipWheel?style=flat-square)](https://github.com/mustafasavul/ClipWheel/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Platforms](https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)](#-installation--quick-start)
[![Telemetry: none](https://img.shields.io/badge/telemetry-none-brightgreen?style=flat-square)](#-privacy-model)

![ClipWheel demo — fast and fluid radial clipboard wheel in action](docs/media/clipwhell-entry.gif)

</div>

---

## 🎡 Why a wheel, not another list?

Every other clipboard manager gives you a **vertical list**: open a window, read top to bottom, find the right row, click. That is a *search* task — your eyes do the work, every single time.

ClipWheel makes it a **muscle-memory** task.

- **Fixed positions.** Your last N copies sit in the same slices every time. "The one before last" is always the same direction — up-right, not "somewhere around row 2".
- **Radial means equidistant.** In a list, item 8 is eight rows farther than item 1. On a wheel, every slice is the same flick away.
- **One gesture, no reading.** Open the wheel, move toward the slice, select. Or press `1`–`8`. The wheel closes and the item is back on your clipboard.
- **Peek before you commit.** Hold `Shift` for **Quicklook** — a full preview of the text, code, or image in that slice without leaving the wheel.
- **Sized to your recall, not your archive.** 4 to 12 slices, your choice. The wheel handles the last few things you copied — the 90% case, in under a second. The history window handles the other 10%, with search, filters, and previews.

---

## ✨ Key Features

### The Wheel
- **Radial overlay** on a global shortcut, at screen center or at your cursor.
- **4–12 configurable slices**, keyboard selection (`1`–`8`, `Enter`), `Esc` to dismiss.
  <br/>
  <a href="docs/media/clipwhell-whell-customize-whell-items.png" target="_blank"><img src="docs/media/clipwhell-whell-customize-whell-items.png" width="600" alt="Customize Wheel Items" /></a>
- **Shift-to-Quicklook** — inline preview of text, code, and image slices.
  <br/>
  <a href="docs/media/clipwhell-whell-quicklook.png" target="_blank"><img src="docs/media/clipwhell-whell-quicklook.png" width="600" alt="Quicklook Preview" /></a>
- **Keyboard Shortcuts** — Lightning fast selection utilizing your muscle memory.
  <br/>
  <a href="docs/media/clipwhell-whell-shortcuts.png" target="_blank"><img src="docs/media/clipwhell-whell-shortcuts.png" width="600" alt="Shortcuts Configuration" /></a>
- **Fully themeable** — color presets, per-segment palettes, and custom colors for segments, the active slice, rings, labels, and panel; up to 24 saved custom presets.
  <br/>
  <p align="center">
    <a href="docs/media/clipwhell-apperance-color-1.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-1.png" width="30%" alt="Theme Color 1" /></a>
    <a href="docs/media/clipwhell-apperance-color-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-2.png" width="30%" alt="Theme Color 2" /></a>
    <a href="docs/media/clipwhell-apperance-color-3.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-3.png" width="30%" alt="Theme Color 3" /></a>
  </p>
  <p align="center">
    <a href="docs/media/clipwhell-apperance.png" target="_blank"><img src="docs/media/clipwhell-apperance.png" width="48%" alt="Appearance Settings" /></a>
    <a href="docs/media/clipwhell-apperance-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-2.png" width="48%" alt="Appearance Customization" /></a>
  </p>

### History & Search
- Full history window with **search, type filters, date filters, and pagination**.
- **Rich preview panel** for text, code, rich text, URLs, images, and file references.
- **Metadata per item**: byte size, readable size, text length, line count, file count, created and last-used time.
- **Pin, favorite, and text transformations** on any entry.
- **Trash with soft delete**, restore, and explicit permanent purge.

### Capture
- Plain text · rich text / HTML / RTF · images and screenshots · file & folder references · URLs · code snippets with language detection · terminal commands.
- Local image asset storage with generated thumbnails.
- Per-type capture toggles and duplicate handling.

### Privacy & Control
- **Pause capture**, **ignored source apps**, and **clear-on-quit**.
- System / dark / light theme, following the OS by default.
- **24 languages** shipped, including RTL (Arabic, Persian).
- Tray icon, autostart, and signed in-place updates from GitHub Releases.

---

## 🔒 Privacy Model

ClipWheel is **local-first by design, not by promise**:

- Everything lives in a local **SQLite** database and an image asset folder inside the Tauri app data directory.
- **No telemetry. No analytics. No accounts. No cloud sync. No external services.**
- The only network call the app makes is the update check against the public GitHub Releases metadata URL.
- Clipboard content is stored exactly as copied — no cloud classifier, no OCR, no masking layer shipping anything off-device.

Your clipboard is often your most sensitive data: passwords, tokens, private messages. That is why it never leaves the machine.

---

## 📦 Installation & Quick Start

### macOS

```bash
brew install --cask mustafasavul/tap/clipwheel
```

Or grab the `.dmg` for your chip from the [latest release](https://github.com/mustafasavul/ClipWheel/releases/latest): `ClipWheel_0.2.0_aarch64.dmg` (Apple Silicon) or `ClipWheel_0.2.0_x64.dmg` (Intel).

### Windows

Download and run from the [latest release](https://github.com/mustafasavul/ClipWheel/releases/latest): `ClipWheel_0.2.0_x64-setup.exe` (NSIS installer) or `ClipWheel_0.2.0_x64_en-US.msi`.

### Linux

```bash
sudo apt install ./ClipWheel_0.2.0_amd64.deb
```

```bash
chmod +x ClipWheel_0.2.0_amd64.AppImage && ./ClipWheel_0.2.0_amd64.AppImage
```

> Early releases may be unsigned or ad-hoc signed. macOS Gatekeeper and Windows SmartScreen may warn until Apple notarization and Windows trusted signing are configured.

### First 30 seconds

1. Launch ClipWheel — it lives in your tray / menu bar.
2. Copy a few things.
3. Press **`Cmd+Shift+V`** (macOS) or **`Ctrl+Shift+V`** (Windows/Linux).
4. Move toward a slice, or press `1`–`8`. Hold `Shift` to preview first.
5. Paste.

| Action | Shortcut |
| --- | --- |
| Open wheel | `Cmd+Shift+V` / `Ctrl+Shift+V` |
| Select item | `1`–`8` or `Enter` |
| Quicklook preview | Hold `Shift` |
| Close wheel | `Esc` |

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Desktop runtime | Tauri v2 |
| Native backend | Rust — clipboard polling, global shortcuts, tray, OS APIs |
| Storage | SQLite via Diesel ORM and migrations |
| Frontend | React 19, TypeScript, Vite |
| Async state | TanStack React Query |
| UI | `lucide-react`, `highlight.js`, `sanitize-html`, semantic CSS tokens |
| Quality | Vitest, ESLint, `tsc --noEmit` |
| Packaging | Tauri CLI — dmg, msi, nsis, AppImage, deb |

Native binary, small footprint, no Electron.

---

## 🛠 Development

```bash
pnpm install
pnpm dev
```

Validate before opening a PR:

```bash
pnpm lint && pnpm typecheck && pnpm version:check && pnpm test
```

Build installers:

```bash
pnpm tauri build
```

Release builds require `TAURI_SIGNING_PRIVATE_KEY` (and optionally `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`). CI smoke packaging uses `pnpm package:ci`, so pull requests build without release signing secrets.

### Project structure

| Path | Owns |
| --- | --- |
| `src-tauri/src` | OS APIs, clipboard, tray, shortcuts, SQLite, cleanup, Tauri commands |
| `src/shared` | Pure TypeScript domain types, constants, i18n bundles, utilities |
| `src/renderer/api` | Typed Tauri command/event boundary (`clipwheelClient.ts`) |
| `src/renderer/data` | React Query hooks, cache invalidation, API provider wiring |
| `src/renderer/features` | Feature surfaces: `wheel`, `history`, `preview`, `settings` |
| `src/renderer/presentation` | Formatting and display helpers |
| `src/renderer/ui` | Reusable UI primitives |
| `src/renderer/styles` | Semantic tokens, layout and feature CSS |

Architecture rules for contributors and coding agents: [AGENTS.md](AGENTS.md). Workflow: [CONTRIBUTING.md](CONTRIBUTING.md). Release and versioning docs: [docs/](docs).

---

## 🗺 Roadmap

- Apple notarized and Windows trusted-signed builds
- Configurable global shortcut recording
- Native file clipboard restore
- Import / export for local backups
- More syntax languages and preview types

## ⚠️ Known Limitations

- Auto paste exists as a setting but is disabled and not simulated yet.
- File references restore as text paths for now.
- Source app detection is a placeholder — cross-platform active-app APIs differ.
- Installs that already chose `dark` or `light` keep that choice; new installs default to `system`.

---

## 🤝 Contributing

Issues and pull requests welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). If ClipWheel saves you time, a ⭐ helps other people find it.

## 📄 License

[MIT](LICENSE) © ClipWheel Contributors

---

<div align="center">

<sub><b>Keywords:</b> clipboard manager · radial menu · pie menu · circular menu · round menu · wheel menu · rotary menu · marking menu · ring menu · arc menu · compass menu · spinner menu · hotbox · clipboard history · macOS clipboard manager · Windows clipboard manager · Linux clipboard manager · open source clipboard manager · privacy-first · offline · Tauri · Rust · React · Ditto alternative · Paste alternative · Maccy alternative · CopyQ alternative</sub>

</div>
