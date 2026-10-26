# Chroniques Oubliées 2 — Thème Héritage & Grimoire (Foundry VTT v14)

Module de thème visuel et d'interface pour le système **Chroniques Oubliées Fantasy 2e Édition (`co2`)** sous **Foundry VTT v14**, avec une direction artistique immersive Papier Velin & Nuit Indigo Royale.

---

## Structure du projet

```text
co2-heritage-theme/
├── AGENTS.md                # Guide d'architecture et règles techniques CSS/DOM
├── README.md                # Documentation d'installation et d'utilisation
├── module.json              # Manifeste officiel Foundry VTT v14 (cible le système "co2")
├── link-foundry.bat         # Lanceur rapide Windows pour lier le module dans Foundry VTT
├── scripts/
│   └── main.mjs             # Point d'entrée ESModule (Paramètres, Hooks ApplicationV2 & ornements DOM)
├── styles/
│   ├── theme.css            # Point d'entrée CSS principal + Import des polices
│   ├── variables.css        # Palettes (Thème Clair Papier Velin & Thème Sombre Nuit Indigo)
│   ├── ui-core.css          # Stylisation de l'interface Foundry VTT v14 (Fenêtres, Hotbar, Sidebar)
│   ├── sheets-co2.css       # Stylisation des feuilles PJ, PNJ, Objets & Dialogues de Chroniques Oubliées 2
│   └── chat-co2.css         # Stylisation des cartes de chat et jets de dés
├── lang/
│   ├── fr.json              # Traduction française des options du module
│   └── en.json              # Traduction anglaise
└── tools/
    └── link-foundry.ps1     # Script PowerShell pour lier ce dossier dans FoundryVTT/Data/modules
```

---

## Installation en mode Développement (Lien direct avec Foundry VTT)

1. Double-cliquez sur [`link-foundry.bat`](./link-foundry.bat) ou exécutez le script PowerShell pour créer une jonction Windows vers votre dossier `Data/modules` de Foundry VTT :
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\tools\link-foundry.ps1
   ```
   *(Si votre dossier `Data` de Foundry VTT se trouve sur un autre disque, passez `-FoundryDataPath "D:\Votre\Chemin\Data"`).*

2. Lancez **Foundry VTT v14**, ouvrez votre monde **Chroniques Oubliées 2**, puis allez dans :
   **Paramètres (roue crantée) → Gérer les modules** et cochez **« Chroniques Oubliées 2 - Thème Héritage & Grimoire »**.

3. Le thème suit **automatiquement le réglage natif de Foundry** (Configuration > Thème de l'interface) : clair = Papier Velin, sombre = Nuit Indigo. Chaque joueur peut personnaliser ses options dans **Configurer les paramètres > Paramètres des modules** :
   - **Activer le thème Héritage & Grimoire** (activé par défaut, permet à un joueur de revenir au visuel de base du système sans affecter les autres).
   - **Ornements et bordures (Hexagones ⬡, Fanion NIV. & Double Filet Or)**
   - **Styliser l'interface globale de Foundry VTT**
   - **Mode compact pour les feuilles**

---

## Astuce Développeur (Hot Reload & Inspection CO2)

- Le manifeste [`module.json`](./module.json) active le flag `hotReload` sur les fichiers `.css`, `.hbs` et `.json`.
- Dans la console de Foundry (`F12`), vous pouvez taper :
  ```js
  CO2Theme.inspectOpenSheets()
  ```
  pour lister toutes les feuilles ouvertes du système `co2` ainsi que leurs classes CSS exactes.
