# AGENTS.md — Chroniques Oubliées 2 : Thème Héritage & Grimoire (`co2-heritage-theme`)

Ce document sert de référence technique et de guide d'architecture pour tout agent IA ou développeur intervenant sur le module Foundry VTT v14 **`co2-heritage-theme`**.

---

## 1. Vue d'ensemble du projet

- **ID du module** : `co2-heritage-theme`
- **Cible Foundry VTT** : **v14** (architecture `ApplicationV2` / `ActorSheetV2`, `hotReload: true`)
- **Système ciblé** : **Chroniques Oubliées Fantasy 2e Édition** (`id: "co2"`, version `2.3.12+`)
- **Objectif** : Remplacer l'habillage visuel par défaut du système `co2` par un thème élégant et immersif (Papier Velin Doux & Nuit Indigo Royale), tout en **conservant strictement la structure et les 5 onglets de base** du système Foundry (`Principal/Actions`, `Inventaire`, `Voies & Capacités`, `Effets`, `Biographie`).

---

## 2. Environnement local & Déploiement

### Chemins standards (Windows)
- **Lien Junction Foundry VTT** : `%LOCALAPPDATA%\FoundryVTT\Data\modules\co2-heritage-theme`
  - Créé via [`tools/link-foundry.ps1`](./tools/link-foundry.ps1) ou [`link-foundry.bat`](./link-foundry.bat) (`powershell -ExecutionPolicy Bypass -File .\tools\link-foundry.ps1`).
  - Toute modification dans `styles/`, `scripts/` ou `lang/` est immédiatement répercutée dans Foundry VTT grâce au lien Junction et à `"hotReload": true` dans [`module.json`](./module.json).
- **Code source du système `co2` installé (lecture seule pour référence)** :
  - `%LOCALAPPDATA%\FoundryVTT\Data\systems\co2\`
  - Feuille de style du système : `systems/co2/css/co.css`
  - Templates Handlebars : `systems/co2/templates/actors/`
  - Classes ApplicationV2 : `systems/co2/module/applications/sheets/`

### Astuces pour les outils de l'Agent
1. **Lecture des fichiers dans `%LOCALAPPDATA%\FoundryVTT`** : Si le bac à sable terminal (`run_command`) restreint l'énumération des dossiers hors du workspace, privilégier l'outil **`read_file`** pour inspecter directement les fichiers du système `co2` (`systems/co2/css/co.css`, `systems/co2/templates/...`).
2. **Navigateur intégré (`/browser` / `chrome_devtools`)** :
   - Si le navigateur utilisé est basé sur Chromium (Chrome, Brave, Edge), vérifier la présence du fichier `DevToolsActivePort` dans le dossier `User Data` correspondant lorsque le débogage à distance (`chrome://inspect/#remote-debugging`) est activé.

---

## 3. Architecture des fichiers du module

```text
co2-heritage-theme/
├── .github/
│   └── workflows/
│       └── release.yml       # Action GitHub : Release Please + packaging module.zip & upload assets
├── .release-please-manifest.json # Suivi de la version courante pour Release Please
├── release-please-config.json    # Configuration Release Please (mise à jour auto de module.json)
├── AGENTS.md                 # Documentation d'architecture et règles pour les agents
├── README.md                 # Documentation utilisateur & installation
├── module.json               # Manifeste Foundry VTT v14 (id: co2-heritage-theme, system: co2)
├── link-foundry.bat          # Lanceur rapide pour créer la jonction Windows sans bloquer sur ExecutionPolicy
├── tools/
│   └── link-foundry.ps1      # Script PowerShell de création du lien Junction vers FoundryVTT/Data/modules
├── lang/
│   ├── fr.json               # Traductions françaises des paramètres du module
│   └── en.json               # Traductions anglaises des paramètres du module
├── scripts/
│   └── main.mjs              # Point d'entrée ESModule : settings, attributs body, hooks ApplicationV2 & DOM
└── styles/
    ├── theme.css             # Point d'entrée CSS (@import Google Fonts + sous-modules CSS)
    ├── variables.css         # Palettes --co-* et --co2-* (Thème Clair Velin & Thème Sombre Indigo)
    ├── ui-core.css           # Habillage des fenêtres ApplicationV2 (.window-header), hotbar, sidebar
    ├── sheets-co2.css        # Stylisation complète des feuilles PJ (.character), PNJ (.encounter), Objets & Dialogues
    └── chat-co2.css          # Stylisation des cartes de chat et jets de dés (.chat-message, .type-card)
```

---

## 4. Direction artistique & Charte Héritage & Grimoire

Le module propose un sélecteur d'ambiances visuelles (presets) dans les réglages du module (`game.settings.get("co2-heritage-theme", "themePreset")`, scope: client), contrôlé par l'attribut `body[data-co2-theme-preset="..."]`.
Par défaut (`"auto"`), le thème s'adapte automatiquement au thème natif de Foundry (clair → Papier Velin, sombre → Nuit Indigo).

### Presets disponibles :
1. `theme-2-vellum-2024` — *Papier Velin Doux & Or-Bronze* (Clair / Défaut clair) : Médaillon `◇ ⬡ ◇`
2. `theme-4-indigo-night-2024` — *Nuit Indigo Royale & Or-Bronze* (Sombre / Défaut sombre) : Médaillon `◇ ⬡ ◇`
3. `theme-forest-amber` — *Sylve & Sève d'Or (Mousse Ancestrale & Cuivre/Ambre)* : Médaillon `✦ 🍃 ✦`
4. `theme-dwarf-forge` — *Forge & Braise (Granite Sombre & Cuivre Incandescent)* : Médaillon `◆ ⚒ ◆`
5. `theme-frost-silver` — *Cœur de Givre (Bleu Polaire & Argent Stellaire)* : Médaillon `✦ ❄ ✦`
6. `theme-desert-lapis` — *Sables d'Ocre & Lapis-Lazuli (Ambiance Sud & Or Solaire)* : Médaillon `✦ ☀️ ✦`
7. `theme-gothic-blood` — *Sang de Cendre & Fer Noir (Dark Fantasy & Gothique)* : Médaillon `✦ 🗡 ✦`
8. `theme-royal-illumination` — *Enluminure Royale (Cobalt Héraldique & Or Impérial)* : Médaillon `✦ ⚜ ✦`
9. `theme-cthulhu-abyss` — *Abysses de R'lyeh (Horreur Cosmique & Vert-de-Gris)* : Médaillon `✦ 🜏 ✦`

### Ornements graphiques signatures (`body[data-co2-ornaments="true"]`)
1. **Cadre géométrique ornemental (`.co2-book-frame`)** :
   - Injecté par `enhanceCO2SheetDOM()` ([`scripts/main.mjs`](./scripts/main.mjs)) dans `.co.application.sheet.actor .window-content` (avec `pointer-events: none`).
   - Comprend un double filet Or-Bronze, 4 coins carrés à degrés (`.co2-corner.tl/tr/bl/br`) et 2 médaillons centraux `◇ ⬡ ◇` (`.co2-hex-medallion.top/bottom`).
2. **En-tête de fiche (`.sheet-header`)** :
   - **Nom (`.name`)** : Police `Cinzel`, souligné d'un double filet Or (`border-bottom: 3px double var(--co2-border-gold)`).
   - **Cartouches bicolores (`.traits .species` & `.traits .profiles`)** : Transformés en boîtes `[ PEUPLE | ... ]` et `[ PROFIL | ... ]` via `::before`.
   - **Fanion de Niveau (`.level`)** : Ruban vertical taillé en queue d'aronde (`clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)`) avec l'emblème `⬡ NIV.` (ou `⬡ NC` sur les fiches de rencontre).
3. **Bandeaux de Sections & Voies (`⬡ VOIE DE ... | RANG X`)** :
   - Tous les `.section-header h4` et `.items-container-header h4` affichent un médaillon hexagonal `⬡` via `::before`.
   - Dans [`scripts/main.mjs`](./scripts/main.mjs), `enhanceCO2SheetDOM()` transforme les intitulés de voies `Voie de l'Archer (3)` en `<span>Voie de l'Archer</span><span class="co2-rank-pipe">RANG 3</span>`.
   - Les numéros de rangs (`.item-detail.rank`) sont affichés dans des badges carrés Or-Bronze (`21×21px`).
4. **Encadrés "Fiche Technique" (`.notes-section`, `.properties .notes`)** :
   - Bordure haute et basse à double filet Or (`border-top: 3px double var(--co2-border-gold); border-bottom: 3px double var(--co2-border-gold);`) sur fond `--co2-bg-callout`.

---

## 5. Pièges connus de `co.css` / `foundry2.css` & Règles CSS impératives

Lors de toute modification dans [`styles/sheets-co2.css`](./styles/sheets-co2.css) ou [`styles/variables.css`](./styles/variables.css), **ne jamais casser les correctifs suivants** :

1. **Conflit des listes déroulantes (`<select>` / `<option>`) entre `co.css` et `foundry2.css`** :
   - `systems/co2/css/co.css` (lignes 208–214) définit une règle globale non scopée `.theme-dark select option { background: var(--co-window-content); }` et `.theme-light select option { background: inherit; }`.
   - Par ailleurs, chaque fenêtre CO2 possède son propre `theme-light` / `theme-dark` indépendant du `body.theme-dark` de Foundry.
   - **Règle** : Toujours maintenir le bloc **Section 0** dans [`styles/sheets-co2.css`](./styles/sheets-co2.css) qui force `color-scheme: var(--co2-color-scheme)`, `--input-background-color: var(--co2-bg-card)`, `--input-text-color: var(--co2-text-primary)` et `background-color: var(--co2-bg-card) !important; color: var(--co2-text-primary) !important;` sur tous les `select`, `select option`, `optgroup`, `input` et `.field-value` à l'intérieur de `.co.application` (ainsi que la protection `body.co2-theme-active.theme-dark select:not(.co select) option` pour l'interface Foundry hors CO2).
2. **Double classe `.items-container-header.item` dans `paths.hbs`** :
   - Dans `systems/co2/templates/actors/shared/paths.hbs`, l'en-tête d'une voie est un `<li class="items-container-header item flexrow draggable">`.
   - **Règle** : Toujours cibler les lignes d'objets avec `.items-container .item:not(.items-container-header)` pour les bordures et le `:hover`, afin de ne jamais écraser le fond dégradé Or-Bronze de `.items-container-header`.
3. **Largeur par défaut de la fiche PJ (`840px`) et prévention du débordement horizontal** :
   - Dans `co.css`, `.abilities` utilise `grid-template-columns: repeat(7, minmax(80px, 1fr)) auto;` et `foundry2.css` applique `flex: 1 1 0%` sur `.sheet-tabs [data-tab]`, ce qui tronque `"VOIES & CAPACITÉS"` et fait déborder `.sheet-header` de `30px` à droite.
   - **Règle** : Conserver `grid-template-columns: repeat(7, minmax(0, 1fr)) auto !important;` sur `.abilities`, `display: none !important;` sur `.abilities-controls:empty` (en mode lecture verrouillé), et `flex: 1 1 auto !important;` sur `.sheet-tabs [data-tab]`.
4. **Alignement de `MANA` (`.resource-section`) dans la barre latérale gauche (`.sheet-sidebar`)** :
   - La grille `.sheet-sidebar .scrollable` comporte 6 colonnes. `VIGUEUR` (`.health-section`) occupe `span 3`, mais `co.css` laisse `.resource-section` (`MANA` / `CHANCE` / `RÉCUPÉRATION`) sur `span 2`, ce qui coupe le texte `/ 0`.
   - **Règle** : Conserver `grid-column: auto / span 3;` sur `.sidebar-section.resource-section` pour un alignement symétrique 50% / 50% avec `VIGUEUR`.
5. **Respect du bouton Play/Edit (`slide-toggle.mode-slider`)** :
   - Le composant `<slide-toggle class="mode-slider">` situé à gauche dans `.window-header` permet au joueur/MJ de déverrouiller la fiche (`SHEET_MODES.EDIT`). Ne jamais le masquer sur les fiches principales (`.character`, `.encounter`) et toujours vérifier le rendu des feuilles en mode **Lecture (verrouillé)** ET en mode **Édition (déverrouillé)**.
6. **Survol des onglets (`.sheet-tabs [data-tab]:hover`) et halo rouge Foundry** :
   - `co.css` (ligne 561) applique `border: 2px dotted var(--co-sheet-accent-alt); border-bottom: 0;` au survol des onglets, et `foundry2.css` ajoute un `text-shadow` rouge sur `a:hover`.
   - **Règle** : Toujours forcer `border: 1.5px solid ... !important; border-bottom: none !important; text-shadow: none !important;` sur `.sheet-tabs [data-tab]` et ses états `:hover` / `.active`.
7. **Lignes d'attaques PNJ (`.item.attack`) et cartes de dommages (`.damage-card`)** :
   - `co.css` force `height: 30px; line-height: 30px;` sur `.items-container .item`, ce qui écrase les blocs `.item.attack` multi-lignes des rencontres, et utilise des dégradés marrons/violets en dur (`#8f7656`, `#5d142b3d`, `top: 10px` sur `.target-portrait`) dans les cartes de chat `.co.chat-card.roll-card.damage-card`.
   - **Règle** : Maintenir `height: auto !important; line-height: 1.4 !important;` sur `.item.attack` et conserver les surcharges de `.co.chat-card.roll-card` dans [`styles/chat-co2.css`](./styles/chat-co2.css).

---

## 6. Conventions de commit & Automatisation des Releases (Release Please)

Le dépôt utilise **Google Release Please** ([`.github/workflows/release.yml`](./.github/workflows/release.yml)) pour automatiser la gestion des versions, la rédaction du `CHANGELOG.md`, la mise à jour de `"version"` dans [`module.json`](./module.json), et la publication des assets `module.zip` & `module.json` sur GitHub Releases.

### Règle impérative : Conventional Commits
Tout agent ou contributeur travaillant sur le dépôt **doit obligatoirement** formater ses messages de commit selon la spécification [Conventional Commits](https://www.conventionalcommits.org/) :

| Préfixe | Impact SemVer | Description | Exemple |
|---|---|---|---|
| `fix:` | **PATCH** (`0.1.0` → `0.1.1`) | Correction de bug ou ajustement CSS | `fix: alignement de la jauge de mana dans la sidebar` |
| `feat:` | **MINOR** (`0.1.0` → `0.2.0`) | Nouvelle fonctionnalité ou habillage | `feat: ajout des ornements pour les fiches d'objets` |
| `feat!:` / `fix!:` | **MAJOR** (`0.1.0` → `1.0.0`) | Changement cassant (*Breaking Change*) | `feat!: refonte complète compatible Foundry v15` |
| `docs:` | Aucun (groupé) | Documentation (`README.md`, `AGENTS.md`) | `docs: mise à jour des instructions de release` |
| `style:` | Aucun (groupé) | Formatage, indentation, espaces (sans impact visuel) | `style: nettoyage des espaces inutiles dans theme.css` |
| `refactor:` | Aucun (groupé) | Restructuration de code sans modif de comportement | `refactor: modularisation des hooks ApplicationV2` |
| `ci:` / `chore:` | Aucun (groupé) | Maintenance CI/CD ou outils de dev | `ci: mise à jour du workflow release-please` |

### Cycle de publication automatisé
1. **Pousser sur `main`** : Les commits sont poussés librement sur la branche principale sans déclencher de release intempestive.
2. **Pull Request de Release automatique** : Release Please analyse les commits et maintient automatiquement une Pull Request intitulée `chore(main): release X.Y.Z` contenant le `CHANGELOG.md` rédigé et la montée de version de `module.json`.
3. **Publication** : Dès que l'utilisateur ou le mainteneur clique sur **Merge pull request** sur GitHub, l'action :
   - Tagge la version (`vX.Y.Z`).
   - Crée la Release officielle sur GitHub.
   - Archive et attache `module.zip` et `module.json`.

