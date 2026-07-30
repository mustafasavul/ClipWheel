<div align="center">

<img src="docs/media/whell.gif" alt="ClipWheel Action" width="600" />

# ClipWheel — Der einzigartige radiale Zwischenablage-Manager

**Schluss mit dem Scrollen durch Listen des Zwischenablage-Verlaufs. Entdecken Sie den schnellsten Weg zu Ihrer Zwischenablage mit einer Ringmenü-Oberfläche. Drücken Sie eine Tastenkombination, wischen Sie zu dem gewünschten Segment und fügen Sie ein.**

ClipWheel ist ein kostenloser, quelloffener, datenschutzorientierter Zwischenablage-Manager für **macOS, Windows und Linux** — mit einem atemberaubenden radialen Rad (auch bekannt als Ringmenü, Marking Menu oder Hotbox), das Ihre letzten 4–12 kopierten Elemente nur eine Geste entfernt hält, wobei Ihre Daten Ihr Gerät niemals verlassen.

<div style="margin-bottom: 20px;">
<img src="assets/brand/clipwheel-logo-transparent.png" alt="ClipWheel Logo" width="128" />
</div>

[![Release](https://img.shields.io/github/v/release/mustafasavul/ClipWheel?style=flat-square)](https://github.com/mustafasavul/ClipWheel/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Platforms](https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)](#-installation--schnellstart)
[![Telemetry: none](https://img.shields.io/badge/telemetry-none-brightgreen?style=flat-square)](#-datenschutz-modell)

![ClipWheel Demo — Schnelles und flüssiges radiales Zwischenablage-Rad in Aktion](docs/media/clipwhell-entry.gif)

</div>

---

## 🎡 Warum ein Rad und nicht noch eine Liste?

Jeder andere Zwischenablage-Manager bietet Ihnen eine **vertikale Liste**: Fenster öffnen, von oben nach unten lesen, die richtige Zeile finden, klicken. Das ist eine *Suchaufgabe* — Ihre Augen leisten jedes Mal die Arbeit.

ClipWheel macht es zu einer **Muskelgedächtnis**-Aufgabe.

- **Feste Positionen.** Ihre letzten N kopierten Elemente befinden sich jedes Mal in denselben Segmenten. "Das Vorletzte" ist immer in der gleichen Richtung — oben rechts, nicht "irgendwo in Zeile 2".
- **Radial bedeutet abstandsgleich.** In einer Liste ist Element 8 acht Zeilen weiter entfernt als Element 1. Auf einem Rad ist jedes Segment genau eine Geste entfernt.
- **Eine Geste, kein Lesen.** Öffnen Sie das Rad, bewegen Sie sich zum Segment, wählen Sie aus. Oder drücken Sie `1`–`8`. Das Rad schließt sich und das Element ist wieder in Ihrer Zwischenablage.
- **Vorschau vor dem Einfügen.** Halten Sie `Shift` für **Quicklook** — eine vollständige Vorschau des Textes, Codes oder Bildes in diesem Segment, ohne das Rad zu verlassen.
- **Größe nach Ihrer Erinnerung, nicht nach Ihrem Archiv.** 4 bis 12 Segmente, Ihre Wahl. Das Rad verwaltet die letzten paar Dinge, die Sie kopiert haben — der 90%-Fall, in unter einer Sekunde. Das Verlaufsfenster kümmert sich um die restlichen 10%, mit Suche, Filtern und Vorschauen.

---

## ✨ Hauptfunktionen

### Das Rad
- **Radiales Overlay** mit einer globalen Tastenkombination, in der Bildschirmmitte oder an Ihrem Mauszeiger.
- **4–12 konfigurierbare Segmente**, Tastaturauswahl (`1`–`8`, `Enter`), `Esc` zum Schließen.
  <br/>
  <a href="docs/media/clipwhell-whell-customize-whell-items.png" target="_blank"><img src="docs/media/clipwhell-whell-customize-whell-items.png" width="600" alt="Rad-Elemente anpassen" /></a>
- **Shift für Quicklook** — Inline-Vorschau von Text-, Code- und Bildsegmenten.
  <br/>
  <a href="docs/media/clipwhell-whell-quicklook.png" target="_blank"><img src="docs/media/clipwhell-whell-quicklook.png" width="600" alt="Quicklook-Vorschau" /></a>
- **Tastenkombinationen** — Blitzschnelle Auswahl unter Nutzung Ihres Muskelgedächtnisses.
  <br/>
  <a href="docs/media/clipwhell-whell-shortcuts.png" target="_blank"><img src="docs/media/clipwhell-whell-shortcuts.png" width="600" alt="Verknüpfungskonfiguration" /></a>
- **Vollständig anpassbares Design** — Farbvoreinstellungen, segmentspezifische Paletten und benutzerdefinierte Farben für Segmente, das aktive Segment, Ringe, Beschriftungen und Panel; bis zu 24 gespeicherte benutzerdefinierte Voreinstellungen.
  <br/>
  <p align="center">
    <a href="docs/media/clipwhell-apperance-color-1.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-1.png" width="30%" alt="Designfarbe 1" /></a>
    <a href="docs/media/clipwhell-apperance-color-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-2.png" width="30%" alt="Designfarbe 2" /></a>
    <a href="docs/media/clipwhell-apperance-color-3.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-3.png" width="30%" alt="Designfarbe 3" /></a>
  </p>
  <p align="center">
    <a href="docs/media/clipwhell-apperance.png" target="_blank"><img src="docs/media/clipwhell-apperance.png" width="48%" alt="Darstellungseinstellungen" /></a>
    <a href="docs/media/clipwhell-apperance-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-2.png" width="48%" alt="Darstellungsanpassung" /></a>
  </p>

### Verlauf & Suche
- Vollständiges Verlaufsfenster mit **Suche, Typfiltern, Datumsfiltern und Paginierung**.
- **Reichhaltiges Vorschau-Panel** für Text, Code, Rich Text, URLs, Bilder und Dateireferenzen.
- **Metadaten pro Element**: Bytegröße, lesbare Größe, Textlänge, Zeilenanzahl, Dateianzahl, Erstellungs- und letzte Nutzungszeit.
- **Anheften, Favorisieren und Texttransformationen** bei jedem Eintrag.
- **Papierkorb mit Soft-Delete**, Wiederherstellen und explizitem dauerhaftem Löschen.

### Erfassen
- Reiner Text · Rich Text / HTML / RTF · Bilder und Screenshots · Datei- & Ordnerreferenzen · URLs · Code-Snippets mit Spracherkennung · Terminalbefehle.
- Lokale Speicherung von Bild-Assets mit generierten Thumbnails.
- Erfassungs-Umschalter pro Typ und Umgang mit Duplikaten.

### Datenschutz & Kontrolle
- **Erfassung pausieren**, **ignorierte Quell-Apps** und **Löschen beim Beenden**.
- System- / Dunkel- / Hell-Design, folgt standardmäßig dem Betriebssystem.
- **24 Sprachen** enthalten, einschließlich RTL (Arabisch, Persisch).
- Tray-Icon, Autostart und signierte In-Place-Updates von GitHub Releases.

---

## 🔒 Datenschutz-Modell

ClipWheel ist **"Local-First" durch Design, nicht durch Versprechen**:

- Alles lebt in einer lokalen **SQLite**-Datenbank und einem Bild-Asset-Ordner innerhalb des Tauri-App-Datenverzeichnisses.
- **Keine Telemetrie. Keine Analytik. Keine Konten. Keine Cloud-Synchronisierung. Keine externen Dienste.**
- Der einzige Netzwerkaufruf, den die App tätigt, ist die Update-Prüfung gegen die öffentliche GitHub Releases-Metadaten-URL.
- Der Inhalt der Zwischenablage wird genau so gespeichert, wie er kopiert wurde — kein Cloud-Klassifikator, kein OCR, keine Maskierungsebene, die irgendetwas außerhalb des Geräts sendet.

Ihre Zwischenablage enthält oft Ihre sensibelsten Daten: Passwörter, Token, private Nachrichten. Deshalb verlässt sie das Gerät niemals.

---

## 📦 Installation & Schnellstart

### macOS

```bash
brew install --cask mustafasavul/tap/clipwheel
```

Oder holen Sie sich das `.dmg` für Ihren Chip aus dem [neuesten Release](https://github.com/mustafasavul/ClipWheel/releases/latest): `ClipWheel_0.3.0_aarch64.dmg` (Apple Silicon) oder `ClipWheel_0.3.0_x64.dmg` (Intel).

### Windows

Herunterladen und ausführen aus dem [neuesten Release](https://github.com/mustafasavul/ClipWheel/releases/latest): `ClipWheel_0.3.0_x64-setup.exe` (NSIS-Installer) oder `ClipWheel_0.3.0_x64_en-US.msi`.

### Linux

```bash
sudo apt install ./ClipWheel_0.3.0_amd64.deb
```

```bash
chmod +x ClipWheel_0.3.0_amd64.AppImage && ./ClipWheel_0.3.0_amd64.AppImage
```

> Frühe Veröffentlichungen können unsigniert oder ad-hoc signiert sein. macOS Gatekeeper und Windows SmartScreen warnen möglicherweise, bis Apple-Notarisierung und Windows-Trusted-Signing konfiguriert sind.

### Die ersten 30 Sekunden

1. Starten Sie ClipWheel — es befindet sich in Ihrem Tray / Ihrer Menüleiste.
2. Kopieren Sie ein paar Dinge.
3. Drücken Sie **`Cmd+Shift+V`** (macOS) oder **`Ctrl+Shift+V`** (Windows/Linux).
4. Bewegen Sie sich in Richtung eines Segments oder drücken Sie `1`–`8`. Halten Sie `Shift` gedrückt, um zuerst eine Vorschau zu sehen.
5. Einfügen.

| Aktion | Tastenkombination |
| --- | --- |
| Rad öffnen | `Cmd+Shift+V` / `Ctrl+Shift+V` |
| Element auswählen | `1`–`8` oder `Enter` |
| Quicklook-Vorschau | `Shift` gedrückt halten |
| Rad schließen | `Esc` |

---

## 🧱 Tech-Stack

| Ebene | Technologie |
| --- | --- |
| Desktop-Laufzeitumgebung | Tauri v2 |
| Natives Backend | Rust — Zwischenablage-Abfrage, globale Shortcuts, Tray, OS-APIs |
| Speicher | SQLite über Diesel ORM und Migrationen |
| Frontend | React 19, TypeScript, Vite |
| Async-Status | TanStack React Query |
| UI | `lucide-react`, `highlight.js`, `sanitize-html`, semantische CSS-Token |
| Qualität | Vitest, ESLint, `tsc --noEmit` |
| Paketierung | Tauri CLI — dmg, msi, nsis, AppImage, deb |

Native Binary, geringer Speicherbedarf, kein Electron.

---

## 🛠 Entwicklung

```bash
pnpm install
pnpm dev
```

Vor dem Öffnen eines PR validieren:

```bash
pnpm lint && pnpm typecheck && pnpm version:check && pnpm test
```

Installer erstellen:

```bash
pnpm tauri build
```

Release-Builds erfordern `TAURI_SIGNING_PRIVATE_KEY` (und optional `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`). CI-Smoke-Packaging verwendet `pnpm package:ci`, sodass Pull Requests ohne Release-Signaturgeheimnisse gebaut werden.

### Projektstruktur

| Pfad | Enthält |
| --- | --- |
| `src-tauri/src` | OS-APIs, Zwischenablage, Tray, Shortcuts, SQLite, Bereinigung, Tauri-Befehle |
| `src/shared` | Reine TypeScript-Domänentypen, Konstanten, i18n-Bundles, Hilfsprogramme |
| `src/renderer/api` | Typisierte Tauri-Befehls-/Ereignisgrenze (`clipwheelClient.ts`) |
| `src/renderer/data` | React Query Hooks, Cache-Invalidierung, API-Provider-Verdrahtung |
| `src/renderer/features` | Funktionsbereiche: `wheel`, `history`, `preview`, `settings` |
| `src/renderer/presentation` | Formatierungs- und Anzeige-Hilfen |
| `src/renderer/ui` | Wiederverwendbare UI-Komponenten |
| `src/renderer/styles` | Semantische Token, Layout- und Funktions-CSS |

Architekturregeln für Mitwirkende und Coding-Agenten: [AGENTS.md](AGENTS.md). Workflow: [CONTRIBUTING.md](CONTRIBUTING.md). Release- und Versionierungsdokumente: [docs/](docs).

---

## 🗺 Roadmap

- Apple notarisierte und Windows trusted-signierte Builds
- Konfigurierbare Aufzeichnung globaler Shortcuts
- Natives Dateisystem-Zwischenablage-Restore
- Import / Export für lokale Backups
- Weitere Syntaxsprachen und Vorschau-Typen

## ⚠️ Bekannte Einschränkungen

- Automatisches Einfügen (Auto paste) existiert als Einstellung, ist aber deaktiviert und noch nicht simuliert.
- Dateireferenzen werden vorerst als Textpfade wiederhergestellt.
- Die Erkennung der Quell-App ist ein Platzhalter — die plattformübergreifenden APIs für aktive Apps unterscheiden sich.
- Installationen, bei denen bereits das Design `dark` oder `light` gewählt wurde, behalten diese Auswahl; neue Installationen verwenden standardmäßig `system`.

---

## 🤝 Mitwirken

Issues und Pull Requests sind willkommen — siehe [CONTRIBUTING.md](CONTRIBUTING.md) und [SECURITY.md](SECURITY.md). Wenn Ihnen ClipWheel Zeit spart, hilft ein ⭐ anderen Leuten, es zu finden.

## 📄 Lizenz

[MIT](LICENSE) © ClipWheel Mitwirkende

---

<div align="center">

<sub><b>Schlüsselwörter:</b> clipboard manager · radial menu · pie menu · circular menu · round menu · wheel menu · rotary menu · marking menu · ring menu · arc menu · compass menu · spinner menu · hotbox · clipboard history · macOS clipboard manager · Windows clipboard manager · Linux clipboard manager · open source clipboard manager · privacy-first · offline · Tauri · Rust · React · Ditto alternative · Paste alternative · Maccy alternative · CopyQ alternative</sub>

</div>
