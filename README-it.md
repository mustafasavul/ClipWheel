<div align="center">

<img src="assets/brand/clipwheel-logo-transparent.png" alt="Logo ClipWheel" width="128" />

# ClipWheel — L'ultimo gestore radiale degli appunti

**Smettila di scorrere gli elenchi della cronologia degli appunti. Scopri il modo più veloce per accedere ai tuoi appunti con un'interfaccia a menu circolare. Premi una scorciatoia, scorri verso lo spicchio che desideri e incolla.**

ClipWheel è un gestore degli appunti gratuito, open source e incentrato sulla privacy per **macOS, Windows e Linux**, dotato di una straordinaria ruota radiale (nota anche come menu circolare, marking menu o hotbox) che mette le tue ultime 4–12 copie a portata di un solo gesto, con nessun dato che lascia mai la tua macchina.

[![Release](https://img.shields.io/github/v/release/mustafasavul/ClipWheel?style=flat-square)](https://github.com/mustafasavul/ClipWheel/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Platforms](https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)](#-installazione-e-avvio-rapido)
[![Telemetry: none](https://img.shields.io/badge/telemetry-none-brightgreen?style=flat-square)](#-modello-di-privacy)

![ClipWheel demo — ruota degli appunti radiale veloce e fluida in azione](docs/media/clipwhell-entry.gif)

</div>

---

## 🎡 Perché una ruota e non un altro elenco?

Ogni altro gestore di appunti ti offre un **elenco verticale**: apri una finestra, leggi dall'alto verso il basso, trova la riga giusta, fai clic. È un'operazione di *ricerca* — i tuoi occhi fanno il lavoro, ogni singola volta.

ClipWheel la trasforma in un'operazione di **memoria muscolare**.

- **Posizioni fisse.** Le tue ultime N copie si trovano negli stessi spicchi ogni volta. "Il penultimo" è sempre nella stessa direzione: in alto a destra, non "da qualche parte intorno alla riga 2".
- **Radiale significa equidistante.** In un elenco, l'elemento 8 dista otto righe dall'elemento 1. Su una ruota, ogni spicchio è a un identico gesto di distanza.
- **Un solo gesto, nessuna lettura.** Apri la ruota, spostati verso lo spicchio, seleziona. Oppure premi `1`–`8`. La ruota si chiude e l'elemento torna negli appunti.
- **Dai un'occhiata prima di incollare.** Tieni premuto `Shift` per **Quicklook (Sguardo rapido)**: un'anteprima completa del testo, del codice o dell'immagine in quello spicchio senza lasciare la ruota.
- **Dimensionato in base alla tua memoria, non al tuo archivio.** Da 4 a 12 spicchi, a tua scelta. La ruota gestisce le ultime cose che hai copiato, che rappresentano il 90% dei casi, in meno di un secondo. La finestra della cronologia gestisce l'altro 10%, con ricerca, filtri e anteprime.

---

## ✨ Caratteristiche principali

### La Ruota
- **Overlay radiale** tramite una scorciatoia globale, al centro dello schermo o in corrispondenza del cursore.
- **4–12 spicchi configurabili**, selezione da tastiera (`1`–`8`, `Invio`), `Esc` per chiudere.
  <br/>
  <a href="docs/media/clipwhell-whell-customize-whell-items.png" target="_blank"><img src="docs/media/clipwhell-whell-customize-whell-items.png" width="600" alt="Personalizza gli elementi della ruota" /></a>
- **Shift per Quicklook** — anteprima in linea di testo, codice e immagini negli spicchi.
  <br/>
  <a href="docs/media/clipwhell-whell-quicklook.png" target="_blank"><img src="docs/media/clipwhell-whell-quicklook.png" width="600" alt="Anteprima Quicklook" /></a>
- **Scorciatoie da tastiera** — Selezione fulminea sfruttando la tua memoria muscolare.
  <br/>
  <a href="docs/media/clipwhell-whell-shortcuts.png" target="_blank"><img src="docs/media/clipwhell-whell-shortcuts.png" width="600" alt="Configurazione delle scorciatoie" /></a>
- **Completamente personalizzabile** — preset di colori, tavolozze per segmento e colori personalizzati per segmenti, spicchio attivo, anelli, etichette e pannello; fino a 24 preset personalizzati salvati.
  <br/>
  <p align="center">
    <a href="docs/media/clipwhell-apperance-color-1.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-1.png" width="30%" alt="Colore Tema 1" /></a>
    <a href="docs/media/clipwhell-apperance-color-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-2.png" width="30%" alt="Colore Tema 2" /></a>
    <a href="docs/media/clipwhell-apperance-color-3.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-3.png" width="30%" alt="Colore Tema 3" /></a>
  </p>
  <p align="center">
    <a href="docs/media/clipwhell-apperance.png" target="_blank"><img src="docs/media/clipwhell-apperance.png" width="48%" alt="Impostazioni dell'aspetto" /></a>
    <a href="docs/media/clipwhell-apperance-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-2.png" width="48%" alt="Personalizzazione dell'aspetto" /></a>
  </p>

### Cronologia e Ricerca
- Finestra cronologia completa con **ricerca, filtri di tipo, filtri per data e paginazione**.
- **Ricco pannello di anteprima** per testo, codice, rich text, URL, immagini e riferimenti a file.
- **Metadati per ogni elemento**: dimensione in byte, dimensione leggibile, lunghezza del testo, numero di righe, numero di file, data di creazione e ultimo utilizzo.
- **Fissa in alto, aggiungi ai preferiti e trasformazioni di testo** per qualsiasi voce.
- **Cestino con eliminazione logica (soft delete)**, ripristino ed eliminazione permanente esplicita.

### Acquisizione
- Testo normale · testo RTF / HTML · immagini e screenshot · riferimenti a file e cartelle · URL · frammenti di codice con rilevamento del linguaggio · comandi da terminale.
- Archiviazione locale delle immagini con generazione di miniature (thumbnail).
- Opzioni di attivazione dell'acquisizione in base al tipo e gestione dei duplicati.

### Privacy e Controllo
- **Pausa acquisizione**, **app di origine ignorate** e **pulizia all'uscita**.
- Tema di sistema / scuro / chiaro, segue il sistema operativo per impostazione predefinita.
- **24 lingue** incluse, incluso il supporto RTL (arabo, persiano).
- Icona nella barra delle applicazioni, avvio automatico e aggiornamenti sul posto (in-place) firmati dalle Release di GitHub.

---

## 🔒 Modello di Privacy

ClipWheel è **basato sul concetto "local-first" per progettazione, non per promessa**:

- Tutto risiede in un database **SQLite** locale e in una cartella di immagini all'interno della directory dei dati dell'app Tauri.
- **Nessuna telemetria. Nessuna analisi dei dati. Nessun account. Nessuna sincronizzazione cloud. Nessun servizio esterno.**
- L'unica chiamata di rete effettuata dall'app è il controllo degli aggiornamenti rispetto all'URL pubblico dei metadati delle Release di GitHub.
- Il contenuto degli appunti è memorizzato esattamente come è stato copiato: nessun classificatore cloud, nessun OCR, nessun livello di mascheramento che invii dati fuori dal dispositivo.

Spesso i tuoi appunti contengono i dati più sensibili: password, token, messaggi privati. Ecco perché non lasciano mai la tua macchina.

---

## 📦 Installazione e Avvio Rapido

### macOS

```bash
brew install --cask mustafasavul/tap/clipwheel
```

Oppure scarica il file `.dmg` per il tuo chip dalla [versione più recente](https://github.com/mustafasavul/ClipWheel/releases/latest): `ClipWheel_0.2.0_aarch64.dmg` (Apple Silicon) o `ClipWheel_0.2.0_x64.dmg` (Intel).

### Windows

Scarica ed esegui dalla [versione più recente](https://github.com/mustafasavul/ClipWheel/releases/latest): `ClipWheel_0.2.0_x64-setup.exe` (programma di installazione NSIS) o `ClipWheel_0.2.0_x64_en-US.msi`.

### Linux

```bash
sudo apt install ./ClipWheel_0.2.0_amd64.deb
```

```bash
chmod +x ClipWheel_0.2.0_amd64.AppImage && ./ClipWheel_0.2.0_amd64.AppImage
```

> Le prime versioni potrebbero non essere firmate o essere firmate ad-hoc. Gatekeeper (macOS) e SmartScreen (Windows) potrebbero mostrare un avviso finché non saranno configurate l'autenticazione notarile Apple e la firma attendibile di Windows.

### I primi 30 secondi

1. Avvia ClipWheel — risiede nella barra delle applicazioni / barra dei menu.
2. Copia un paio di cose.
3. Premi **`Cmd+Shift+V`** (macOS) o **`Ctrl+Shift+V`** (Windows/Linux).
4. Spostati verso uno spicchio oppure premi `1`–`8`. Tieni premuto `Shift` per visualizzare prima l'anteprima.
5. Incolla.

| Azione | Scorciatoia |
| --- | --- |
| Apri ruota | `Cmd+Shift+V` / `Ctrl+Shift+V` |
| Seleziona elemento | `1`–`8` o `Invio` |
| Anteprima Quicklook | Tieni premuto `Shift` |
| Chiudi ruota | `Esc` |

---

## 🧱 Stack Tecnologico

| Livello | Tecnologia |
| --- | --- |
| Ambiente desktop | Tauri v2 |
| Backend nativo | Rust — polling degli appunti, scorciatoie globali, tray, API del sistema operativo |
| Archiviazione | SQLite tramite Diesel ORM e migrazioni |
| Frontend | React 19, TypeScript, Vite |
| Stato asincrono | TanStack React Query |
| Interfaccia Utente (UI) | `lucide-react`, `highlight.js`, `sanitize-html`, token CSS semantici |
| Qualità | Vitest, ESLint, `tsc --noEmit` |
| Pacchettizzazione | Tauri CLI — dmg, msi, nsis, AppImage, deb |

Eseguibile nativo (binary), ingombro ridotto, nessun utilizzo di Electron.

---

## 🛠 Sviluppo

```bash
pnpm install
pnpm dev
```

Convalida prima di aprire una Pull Request (PR):

```bash
pnpm lint && pnpm typecheck && pnpm version:check && pnpm test
```

Generazione dei programmi di installazione (installer):

```bash
pnpm tauri build
```

Le build di release richiedono `TAURI_SIGNING_PRIVATE_KEY` (e, facoltativamente, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`). Il pacchetto di test "smoke" CI utilizza `pnpm package:ci`, per cui le Pull Request vengono compilate senza segreti di firma per la release.

### Struttura del progetto

| Percorso | Ruolo |
| --- | --- |
| `src-tauri/src` | API del sistema operativo, appunti, tray, scorciatoie, SQLite, pulizia, comandi Tauri |
| `src/shared` | Tipi di dominio TypeScript puri, costanti, pacchetti i18n, utilità |
| `src/renderer/api` | Interfaccia tipizzata per comandi/eventi Tauri (`clipwheelClient.ts`) |
| `src/renderer/data` | Hook di React Query, invalidazione della cache, cablaggio del provider API |
| `src/renderer/features` | Aree delle funzionalità: `wheel`, `history`, `preview`, `settings` |
| `src/renderer/presentation` | Helper per la formattazione e la visualizzazione |
| `src/renderer/ui` | Componenti primitivi della UI riutilizzabili |
| `src/renderer/styles` | Token semantici, layout e CSS delle funzionalità |

Regole di architettura per collaboratori e agenti di codifica: [AGENTS.md](AGENTS.md). Flusso di lavoro: [CONTRIBUTING.md](CONTRIBUTING.md). Documenti su versioni e rilascio: [docs/](docs).

---

## 🗺 Roadmap

- Build con autenticazione notarile Apple e firma attendibile per Windows
- Registrazione di scorciatoie globali configurabili
- Ripristino appunti per file nativi
- Importazione / esportazione per backup locali
- Più linguaggi di sintassi e tipi di anteprima

## ⚠️ Limitazioni Note

- L'incolla automatico (Auto paste) esiste come impostazione ma è disabilitato e non ancora simulato.
- I riferimenti ai file vengono ripristinati per ora come percorsi di testo.
- Il rilevamento dell'app di origine è un segnaposto (placeholder) — le API per l'app attiva variano tra le piattaforme.
- Le installazioni che hanno già scelto un tema `scuro` o `chiaro` mantengono tale scelta; le nuove installazioni adottano per impostazione predefinita il tema di `sistema`.

---

## 🤝 Contribuire

Segnalazioni di problemi (Issue) e Pull Request sono ben accette — vedi [CONTRIBUTING.md](CONTRIBUTING.md) e [SECURITY.md](SECURITY.md). Se ClipWheel ti fa risparmiare tempo, una ⭐ aiuterà altre persone a trovarlo.

## 📄 Licenza

[MIT](LICENSE) © I contributori di ClipWheel

---

<div align="center">

<sub><b>Parole chiave:</b> gestore di appunti · menu radiale · menu a torta · menu circolare · menu rotondo · menu a ruota · menu rotante · marking menu · menu ad anello · menu ad arco · menu a bussola · spinner menu · hotbox · cronologia degli appunti · gestore appunti macOS · gestore appunti Windows · gestore appunti Linux · gestore appunti open source · incentrato sulla privacy · offline · Tauri · Rust · React · alternativa Ditto · alternativa Paste · alternativa Maccy · alternativa CopyQ</sub>

</div>
