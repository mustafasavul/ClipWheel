<div align="center">

<img src="assets/brand/clipwheel-logo-transparent.png" alt="Logo de ClipWheel" width="128" />

# ClipWheel — Le gestionnaire de presse-papiers radial ultime

**Arrêtez de faire défiler les listes d'historique du presse-papiers. Découvrez le moyen le plus rapide d'accéder à votre presse-papiers avec une interface de menu circulaire. Appuyez sur un raccourci, balayez vers la tranche que vous voulez, et collez.**

ClipWheel est un gestionnaire de presse-papiers gratuit, open-source et axé sur la confidentialité pour **macOS, Windows et Linux** — doté d'une superbe roue radiale (également connue sous le nom de menu circulaire, menu de marquage ou hotbox) qui met vos 4 à 12 dernières copies à portée d'un seul geste, sans qu'aucune donnée ne quitte jamais votre machine.

[![Release](https://img.shields.io/github/v/release/mustafasavul/ClipWheel?style=flat-square)](https://github.com/mustafasavul/ClipWheel/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Platforms](https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)](#-installation-et-démarrage-rapide)
[![Telemetry: none](https://img.shields.io/badge/telemetry-none-brightgreen?style=flat-square)](#-modèle-de-confidentialité)

![Démo ClipWheel — roue de presse-papiers radiale rapide et fluide en action](docs/media/clipwhell-entry.gif)

</div>

---

## 🎡 Pourquoi une roue, pas une autre liste ?

Tout autre gestionnaire de presse-papiers vous donne une **liste verticale** : ouvrez une fenêtre, lisez de haut en bas, trouvez la bonne ligne, cliquez. C'est une tâche de *recherche* — vos yeux font le travail à chaque fois.

ClipWheel en fait une tâche de **mémoire musculaire**.

- **Positions fixes.** Vos N dernières copies se trouvent dans les mêmes tranches à chaque fois. "L'avant-dernière" est toujours dans la même direction — en haut à droite, pas "quelque part autour de la ligne 2".
- **Radial signifie équidistant.** Dans une liste, l'élément 8 est huit lignes plus loin que l'élément 1. Sur une roue, chaque tranche est à une même distance de balayage.
- **Un seul geste, aucune lecture.** Ouvrez la roue, déplacez-vous vers la tranche, sélectionnez. Ou appuyez sur `1`–`8`. La roue se ferme et l'élément est de retour dans votre presse-papiers.
- **Aperçu avant de valider.** Maintenez `Shift` pour **Aperçu rapide (Quicklook)** — un aperçu complet du texte, du code ou de l'image dans cette tranche sans quitter la roue.
- **Dimensionné pour votre mémorisation, pas pour vos archives.** 4 à 12 tranches, au choix. La roue gère les dernières choses que vous avez copiées — le cas de 90 %, en moins d'une seconde. La fenêtre d'historique gère les 10 % restants, avec recherche, filtres et aperçus.

---

## ✨ Caractéristiques principales

### La Roue
- **Superposition radiale** sur un raccourci global, au centre de l'écran ou au niveau de votre curseur.
- **4 à 12 tranches configurables**, sélection au clavier (`1`–`8`, `Entrée`), `Échap` pour fermer.
  <br/>
  <a href="docs/media/clipwhell-whell-customize-whell-items.png" target="_blank"><img src="docs/media/clipwhell-whell-customize-whell-items.png" width="600" alt="Personnaliser les éléments de la roue" /></a>
- **Shift pour Aperçu rapide** — aperçu en ligne du texte, du code et des images.
  <br/>
  <a href="docs/media/clipwhell-whell-quicklook.png" target="_blank"><img src="docs/media/clipwhell-whell-quicklook.png" width="600" alt="Aperçu rapide" /></a>
- **Raccourcis clavier** — Sélection ultra-rapide utilisant votre mémoire musculaire.
  <br/>
  <a href="docs/media/clipwhell-whell-shortcuts.png" target="_blank"><img src="docs/media/clipwhell-whell-shortcuts.png" width="600" alt="Configuration des raccourcis" /></a>
- **Entièrement personnalisable** — préréglages de couleurs, palettes par segment et couleurs personnalisées pour les segments, la tranche active, les anneaux, les étiquettes et le panneau ; jusqu'à 24 préréglages personnalisés sauvegardés.
  <br/>
  <p align="center">
    <a href="docs/media/clipwhell-apperance-color-1.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-1.png" width="30%" alt="Couleur du thème 1" /></a>
    <a href="docs/media/clipwhell-apperance-color-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-2.png" width="30%" alt="Couleur du thème 2" /></a>
    <a href="docs/media/clipwhell-apperance-color-3.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-3.png" width="30%" alt="Couleur du thème 3" /></a>
  </p>
  <p align="center">
    <a href="docs/media/clipwhell-apperance.png" target="_blank"><img src="docs/media/clipwhell-apperance.png" width="48%" alt="Paramètres d'apparence" /></a>
    <a href="docs/media/clipwhell-apperance-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-2.png" width="48%" alt="Personnalisation de l'apparence" /></a>
  </p>

### Historique et Recherche
- Fenêtre d'historique complète avec **recherche, filtres de type, filtres de date et pagination**.
- **Panneau d'aperçu riche** pour le texte, le code, le texte enrichi, les URL, les images et les références de fichiers.
- **Métadonnées par élément** : taille en octets, taille lisible, longueur du texte, nombre de lignes, nombre de fichiers, date de création et de dernière utilisation.
- **Épingler, mettre en favori et transformations de texte** sur n'importe quelle entrée.
- **Corbeille avec suppression logicielle (soft delete)**, restauration et purge permanente explicite.

### Capture
- Texte brut · texte enrichi / HTML / RTF · images et captures d'écran · références de fichiers et dossiers · URL · extraits de code avec détection de la langue · commandes de terminal.
- Stockage local des éléments d'image avec des miniatures générées.
- Boutons de basculement de capture par type et gestion des doublons.

### Confidentialité et Contrôle
- **Mettre la capture en pause**, **applications sources ignorées**, et **effacer à la fermeture**.
- Thème système / sombre / clair, suivant l'OS par défaut.
- **24 langues** intégrées, y compris de droite à gauche (RTL) (arabe, persan).
- Icône de la barre d'état système, démarrage automatique et mises à jour sur place signées à partir de GitHub Releases.

---

## 🔒 Modèle de Confidentialité

ClipWheel est **orienté vers le stockage local par sa conception, pas par promesse** :

- Tout vit dans une base de données **SQLite** locale et un dossier d'images à l'intérieur du répertoire de données de l'application Tauri.
- **Aucune télémétrie. Aucune analyse. Aucun compte. Aucune synchronisation cloud. Aucun service externe.**
- Le seul appel réseau que l'application effectue est la vérification des mises à jour par rapport à l'URL publique des métadonnées des versions (Releases) de GitHub.
- Le contenu du presse-papiers est stocké exactement tel qu'il a été copié — pas de classificateur cloud, pas d'OCR, pas de couche de masquage envoyant quoi que ce soit hors de l'appareil.

Votre presse-papiers contient souvent vos données les plus sensibles : mots de passe, jetons (tokens), messages privés. C'est pourquoi il ne quitte jamais la machine.

---

## 📦 Installation et Démarrage rapide

### macOS

```bash
brew install --cask mustafasavul/tap/clipwheel
```

Ou récupérez le fichier `.dmg` pour votre puce à partir de la [dernière version](https://github.com/mustafasavul/ClipWheel/releases/latest) : `ClipWheel_0.2.0_aarch64.dmg` (Apple Silicon) ou `ClipWheel_0.2.0_x64.dmg` (Intel).

### Windows

Téléchargez et exécutez à partir de la [dernière version](https://github.com/mustafasavul/ClipWheel/releases/latest) : `ClipWheel_0.2.0_x64-setup.exe` (installateur NSIS) ou `ClipWheel_0.2.0_x64_en-US.msi`.

### Linux

```bash
sudo apt install ./ClipWheel_0.2.0_amd64.deb
```

```bash
chmod +x ClipWheel_0.2.0_amd64.AppImage && ./ClipWheel_0.2.0_amd64.AppImage
```

> Les premières versions peuvent ne pas être signées ou être signées ad hoc. macOS Gatekeeper et Windows SmartScreen peuvent émettre des avertissements jusqu'à ce que la notarisation Apple et la signature de confiance Windows soient configurées.

### Les 30 premières secondes

1. Lancez ClipWheel — il se trouve dans votre barre d'état système / barre de menus.
2. Copiez quelques éléments.
3. Appuyez sur **`Cmd+Shift+V`** (macOS) ou **`Ctrl+Shift+V`** (Windows/Linux).
4. Déplacez-vous vers une tranche, ou appuyez sur `1`–`8`. Maintenez `Shift` pour prévisualiser d'abord.
5. Collez.

| Action | Raccourci |
| --- | --- |
| Ouvrir la roue | `Cmd+Shift+V` / `Ctrl+Shift+V` |
| Sélectionner un élément | `1`–`8` ou `Entrée` |
| Aperçu rapide (Quicklook) | Maintenir `Shift` |
| Fermer la roue | `Échap` |

---

## 🧱 Pile Technologique (Tech Stack)

| Couche | Technologie |
| --- | --- |
| Runtime de bureau | Tauri v2 |
| Backend natif | Rust — interrogation du presse-papiers, raccourcis globaux, barre d'état, API de l'OS |
| Stockage | SQLite via Diesel ORM et migrations |
| Frontend | React 19, TypeScript, Vite |
| État asynchrone | TanStack React Query |
| Interface Utilisateur | `lucide-react`, `highlight.js`, `sanitize-html`, jetons CSS sémantiques |
| Qualité | Vitest, ESLint, `tsc --noEmit` |
| Packaging | Tauri CLI — dmg, msi, nsis, AppImage, deb |

Binaire natif, faible empreinte, sans Electron.

---

## 🛠 Développement

```bash
pnpm install
pnpm dev
```

Valider avant d'ouvrir une demande d'extraction (PR) :

```bash
pnpm lint && pnpm typecheck && pnpm version:check && pnpm test
```

Générer des installateurs :

```bash
pnpm tauri build
```

Les builds de version nécessitent `TAURI_SIGNING_PRIVATE_KEY` (et optionnellement `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`). L'empaquetage de test CI (smoke packaging) utilise `pnpm package:ci`, de sorte que les requêtes d'extraction sont construites sans les secrets de signature de la version.

### Structure du projet

| Chemin | Rôle |
| --- | --- |
| `src-tauri/src` | API de l'OS, presse-papiers, barre d'état, raccourcis, SQLite, nettoyage, commandes Tauri |
| `src/shared` | Types de domaine purs TypeScript, constantes, bundles i18n, utilitaires |
| `src/renderer/api` | Frontière des commandes/événements Tauri typée (`clipwheelClient.ts`) |
| `src/renderer/data` | Hooks React Query, invalidation de cache, câblage du fournisseur d'API |
| `src/renderer/features` | Surfaces des fonctionnalités : `wheel`, `history`, `preview`, `settings` |
| `src/renderer/presentation` | Auxiliaires de formatage et d'affichage |
| `src/renderer/ui` | Primitives de l'interface utilisateur réutilisables |
| `src/renderer/styles` | Jetons sémantiques, mise en page et CSS des fonctionnalités |

Règles d'architecture pour les contributeurs et les agents de codage : [AGENTS.md](AGENTS.md). Flux de travail : [CONTRIBUTING.md](CONTRIBUTING.md). Documents sur les versions et le versionnage : [docs/](docs).

---

## 🗺 Feuille de route (Roadmap)

- Builds notariés Apple et signés de confiance Windows.
- Enregistrement configurable des raccourcis globaux.
- Restauration du presse-papiers de fichiers natifs.
- Import / export pour les sauvegardes locales.
- Plus de langages de syntaxe et de types d'aperçu.

## ⚠️ Limitations Connues

- Le collage automatique (Auto paste) existe en tant que paramètre mais est désactivé et n'est pas encore simulé.
- Les références de fichiers se restaurent en tant que chemins de texte pour le moment.
- La détection de l'application source est un espace réservé (placeholder) — les API d'application active multiplateformes diffèrent.
- Les installations qui ont déjà choisi le thème `sombre` ou `clair` conservent ce choix ; les nouvelles installations utilisent par défaut le `système`.

---

## 🤝 Contribuer

Les problèmes (Issues) et les demandes d'extraction (Pull requests) sont les bienvenus — voir [CONTRIBUTING.md](CONTRIBUTING.md) et [SECURITY.md](SECURITY.md). Si ClipWheel vous fait gagner du temps, une étoile ⭐ aide d'autres personnes à le trouver.

## 📄 Licence

[MIT](LICENSE) © Les contributeurs de ClipWheel

---

<div align="center">

<sub><b>Mots-clés :</b> gestionnaire de presse-papiers · menu radial · menu en secteurs · menu circulaire · menu rond · menu roue · menu rotatif · menu de marquage · menu anneau · menu arc · menu boussole · menu toupie · hotbox · historique du presse-papiers · gestionnaire de presse-papiers macOS · gestionnaire de presse-papiers Windows · gestionnaire de presse-papiers Linux · gestionnaire de presse-papiers open source · priorité à la confidentialité · hors ligne · Tauri · Rust · React · alternative Ditto · alternative Paste · alternative Maccy · alternative CopyQ</sub>

</div>
