/**
 * Chroniques Oubliées 2 - Thème Héritage & Grimoire
 * Point d'entrée ESModule pour Foundry VTT v14
 */

const MODULE_ID = "co2-heritage-theme";

/**
 * Détermine le schéma de couleurs natif de Foundry (Configuration > Thème de l'interface).
 * Retourne "dark" ou "light".
 */
function getNativeColorScheme() {
  // 1. Réglage explicite de Foundry (Configurer l'interface > Thème des applications)
  try {
    const applications = game.settings.get("core", "uiConfig")?.colorScheme?.applications;
    if (applications === "dark" || applications === "light") return applications;
  } catch (e) {
    /* réglage indisponible : on se rabat sur la classe du body */
  }
  // 2. Mode "par défaut" : Foundry applique theme-dark / theme-light selon le navigateur
  const cl = document.body.classList;
  if (cl.contains("theme-dark")) return "dark";
  if (cl.contains("theme-light")) return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Détermine le médaillon thématique selon le preset actif
 */
function getMedallionSymbol(preset) {
  switch (preset) {
    case "theme-frost-silver": return "✦ ❄ ✦";
    case "theme-dwarf-forge": return "◆ ⚒ ◆";
    case "theme-forest-amber": return "✦ 🍃 ✦";
    case "theme-gothic-blood": return "✦ 🗡 ✦";
    case "theme-desert-lapis": return "✦ ☀️ ✦";
    case "theme-royal-illumination": return "✦ ⚜ ✦";
    case "theme-cthulhu-abyss": return "✦ 🜏 ✦";
    case "theme-astral-glass": return "✦ 🔮 ✦";
    default: return "◇ ⬡ ◇";
  }
}

/**
 * Applique les attributs de thème sur le body selon le réglage de l'utilisateur.
 * Si le joueur a désactivé le thème pour son compte, retire tous les styles et attributs.
 */
export function applyThemeAttributes() {
  const body = document.body;
  if (!body) return;

  const isEnabled = game.settings.get(MODULE_ID, "enableTheme") ?? true;
  if (!isEnabled) {
    body.classList.remove("co2-theme-active");
    delete body.dataset.co2ThemePreset;
    delete body.dataset.co2StyleCore;
    delete body.dataset.co2Ornaments;
    delete body.dataset.co2Compact;

    // Nettoie les fenêtres actuellement ouvertes
    document.querySelectorAll(".co2-themed-window").forEach((el) => {
      el.classList.remove("co2-themed-window");
      delete el.dataset.co2ThemePreset;
      el.querySelector(":scope > .window-content > .co2-book-frame")?.remove();
    });
    return;
  }

  const selectedPreset = game.settings.get(MODULE_ID, "themePreset") ?? "auto";
  const preset = selectedPreset === "auto"
    ? (getNativeColorScheme() === "dark" ? "theme-4-indigo-night-2024" : "theme-2-vellum-2024")
    : selectedPreset;

  const styleCoreUI = game.settings.get(MODULE_ID, "styleCoreUI") ?? true;
  const ornaments = game.settings.get(MODULE_ID, "ornaments") ?? true;
  const compactMode = game.settings.get(MODULE_ID, "compactMode") ?? false;

  if (!body.classList.contains("co2-theme-active")) body.classList.add("co2-theme-active");
  body.dataset.co2ThemePreset = preset;
  body.dataset.co2StyleCore = String(styleCoreUI);
  body.dataset.co2Ornaments = String(ornaments);
  body.dataset.co2Compact = String(compactMode);

  // Réapplique aux fenêtres ouvertes
  document.querySelectorAll(".co.application").forEach((el) => {
    enhanceCO2SheetDOM(el);
  });
}

/**
 * Applique le preset propre à une fenêtre.
 * Si un preset explicite est sélectionné par le joueur, toutes ses fenêtres l'utilisent.
 * En mode "auto", respecte le thème propre de la fenêtre (theme-light / theme-dark)
 * ou le schéma natif de Foundry.
 */
function applyWindowTheme(element) {
  const selectedPreset = game.settings.get(MODULE_ID, "themePreset") ?? "auto";
  let preset;

  if (selectedPreset !== "auto") {
    preset = selectedPreset;
  } else {
    let own = element.classList.contains("theme-dark") ? "dark" : element.classList.contains("theme-light") ? "light" : null;

    if (!own) {
      // 1. Si c'est un objet lié à un acteur (id contient -Actor-<id>-)
      const actorMatch = element.id?.match(/-Actor-([A-Za-z0-9]+)/);
      if (actorMatch) {
        const actorEl = document.querySelector(`.co.application.sheet.actor[id*="${actorMatch[1]}"]`);
        if (actorEl) {
          own = actorEl.classList.contains("theme-dark") ? "dark" : actorEl.classList.contains("theme-light") ? "light" : null;
        }
      }
      // 2. Si c'est un dialogue ou sous-fenêtre, hérite de la fiche d'acteur ouverte la plus récente
      if (!own) {
        const lastActor = document.querySelector(".co.application.sheet.actor");
        if (lastActor) {
          own = lastActor.classList.contains("theme-dark") ? "dark" : lastActor.classList.contains("theme-light") ? "light" : null;
        }
      }
      // 3. À défaut, schéma natif Foundry
      if (!own) own = getNativeColorScheme();
    }

    preset = own === "dark" ? "theme-4-indigo-night-2024" : "theme-2-vellum-2024";
  }

  if (element.dataset.co2ThemePreset !== preset) element.dataset.co2ThemePreset = preset;
  if (!element._co2ThemeObserver) {
    element._co2ThemeObserver = new MutationObserver(() => applyWindowTheme(element));
    element._co2ThemeObserver.observe(element, { attributes: true, attributeFilter: ["class"] });
  }
}

/**
 * Injecte les ornements et finitions dans les feuilles Chroniques Oubliées 2 :
 * 1. Cadre géométrique avec les 4 coins à degrés (╬) et les médaillons thématiques
 * 2. Transformation des titres de Voies "Voie de ... (3)" en "Voie de ... | RANG 3"
 */
function enhanceCO2SheetDOM(element) {
  if (!(element instanceof HTMLElement)) return;
  if (game.system?.id !== "co2") return;

  const isEnabled = game.settings.get(MODULE_ID, "enableTheme") ?? true;
  if (!isEnabled) {
    element.classList.remove("co2-themed-window");
    delete element.dataset.co2ThemePreset;
    element.querySelector(":scope > .window-content > .co2-book-frame")?.remove();
    return;
  }

  element.classList.add("co2-themed-window");
  applyWindowTheme(element);

  const currentPreset = element.dataset.co2ThemePreset || document.body.dataset.co2ThemePreset || "theme-2-vellum-2024";
  const medallionText = getMedallionSymbol(currentPreset);

  // 1. Cadre ornemental sur les feuilles d'acteurs (PJ / PNJ)
  if (element.classList.contains("actor") && !element.classList.contains("character-mini")) {
    const windowContent = element.querySelector(".window-content");
    if (windowContent) {
      let frame = windowContent.querySelector(":scope > .co2-book-frame");
      if (!frame) {
        frame = document.createElement("div");
        frame.className = "co2-book-frame";
        frame.setAttribute("aria-hidden", "true");
        frame.innerHTML = `
          <span class="co2-corner tl"></span>
          <span class="co2-corner tr"></span>
          <span class="co2-corner bl"></span>
          <span class="co2-corner br"></span>
          <span class="co2-hex-medallion top">${medallionText}</span>
          <span class="co2-hex-medallion bottom">${medallionText}</span>
        `;
        windowContent.prepend(frame);
      } else {
        frame.querySelectorAll(".co2-hex-medallion").forEach((el) => {
          if (el.textContent !== medallionText) el.textContent = medallionText;
        });
      }
    }
  }

  // 2. Formatage des bandeaux de Voies : "Voie du ... (3)" -> "Voie du ... | RANG 3"
  element.querySelectorAll('.paths.items-container .items-container-header h4 a[data-action="toggleSection"]').forEach((link) => {
    if (link.querySelector(".co2-rank-pipe")) return;
    const rawText = link.textContent?.trim() ?? "";
    const match = rawText.match(/^(.*?)\s*\((\d+)\)\s*$/);
    if (match) {
      const [, pathName, rankNum] = match;
      link.textContent = "";
      const titleSpan = document.createElement("span");
      titleSpan.textContent = pathName;
      const rankSpan = document.createElement("span");
      rankSpan.className = "co2-rank-pipe";
      rankSpan.textContent = `RANG ${rankNum}`;
      link.append(titleSpan, rankSpan);
    }
  });

  // 3. Réparation du bouton .file-picker dans l'onglet Actions des fiches d'objets (vestige ApplicationV1 de co2)
  element.querySelectorAll(".tab[data-tab].actions button.action-button.file-picker").forEach((btn) => {
    if (btn.dataset.co2BoundFilePicker === "true") return;
    btn.dataset.co2BoundFilePicker = "true";
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (btn.disabled) return;
      const formFields = btn.closest(".form-fields");
      const actionIcon = formFields?.querySelector('img.action-icon[data-action="selectActionIcon"]');
      if (actionIcon) {
        actionIcon.click();
        return;
      }
      const input = formFields?.querySelector('input[type="text"]');
      const FilePickerClass = foundry?.applications?.apps?.FilePicker?.implementation ?? foundry?.applications?.apps?.FilePicker;
      if (input && FilePickerClass) {
        new FilePickerClass({
          type: "image",
          current: input.value,
          field: input,
          callback: (path) => {
            input.value = path;
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }).browse();
      }
    });
  });
}

/**
 * Enregistre les paramètres configurables par le joueur/MJ dans Foundry VTT v14
 */
function registerThemeSettings() {
  game.settings.register(MODULE_ID, "enableTheme", {
    name: "CO2THEME.Settings.EnableTheme.Name",
    hint: "CO2THEME.Settings.EnableTheme.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => applyThemeAttributes()
  });

  game.settings.register(MODULE_ID, "themePreset", {
    name: "CO2THEME.Settings.Preset.Name",
    hint: "CO2THEME.Settings.Preset.Hint",
    scope: "client",
    config: true,
    type: String,
    choices: {
      "auto": "CO2THEME.Settings.Preset.Choices.auto",
      "theme-2-vellum-2024": "CO2THEME.Settings.Preset.Choices.theme-2-vellum-2024",
      "theme-4-indigo-night-2024": "CO2THEME.Settings.Preset.Choices.theme-4-indigo-night-2024",
      "theme-forest-amber": "CO2THEME.Settings.Preset.Choices.theme-forest-amber",
      "theme-dwarf-forge": "CO2THEME.Settings.Preset.Choices.theme-dwarf-forge",
      "theme-frost-silver": "CO2THEME.Settings.Preset.Choices.theme-frost-silver",
      "theme-desert-lapis": "CO2THEME.Settings.Preset.Choices.theme-desert-lapis",
      "theme-gothic-blood": "CO2THEME.Settings.Preset.Choices.theme-gothic-blood",
      "theme-royal-illumination": "CO2THEME.Settings.Preset.Choices.theme-royal-illumination",
      "theme-cthulhu-abyss": "CO2THEME.Settings.Preset.Choices.theme-cthulhu-abyss",
      "theme-astral-glass": "CO2THEME.Settings.Preset.Choices.theme-astral-glass"
    },
    default: "auto",
    onChange: () => applyThemeAttributes()
  });

  game.settings.register(MODULE_ID, "styleCoreUI", {
    name: "CO2THEME.Settings.StyleCoreUI.Name",
    hint: "CO2THEME.Settings.StyleCoreUI.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => applyThemeAttributes()
  });

  game.settings.register(MODULE_ID, "ornaments", {
    name: "CO2THEME.Settings.Ornaments.Name",
    hint: "CO2THEME.Settings.Ornaments.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => applyThemeAttributes()
  });

  game.settings.register(MODULE_ID, "compactMode", {
    name: "CO2THEME.Settings.CompactMode.Name",
    hint: "CO2THEME.Settings.CompactMode.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: () => applyThemeAttributes()
  });
}

/* -------------------------------------------- */
/*  Hooks Foundry VTT v14                       */
/* -------------------------------------------- */

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initialisation du thème Héritage & Grimoire (Foundry VTT v${game.version})`);
  registerThemeSettings();

  window.CO2Theme = {
    applyThemeAttributes,
    inspectOpenSheets() {
      const apps = [
        ...Object.values(ui.windows ?? {}),
        ...Array.from(foundry.applications?.instances?.values?.() ?? [])
      ];
      console.table(
        apps.map((app) => ({
          id: app.id,
          constructor: app.constructor?.name,
          classes: app.options?.classes?.join(" ") || app.element?.className
        }))
      );
      return apps;
    }
  };
});

Hooks.once("ready", () => {
  applyThemeAttributes();
  console.log(`${MODULE_ID} | Thème appliqué avec succès (${document.body.dataset.co2ThemePreset})`);
});

Hooks.on("clientSettingChanged", (key) => {
  if (key === "core.uiConfig") applyThemeAttributes();
});

// Réapplique le thème dès que Foundry change la classe theme-dark / theme-light du body
Hooks.once("ready", () => {
  let lastScheme = getNativeColorScheme();
  new MutationObserver(() => {
    const scheme = getNativeColorScheme();
    if (scheme === lastScheme) return;
    lastScheme = scheme;
    applyThemeAttributes();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
});

Hooks.on("renderApplicationV2", (app, element) => {
  enhanceCO2SheetDOM(element);
});

Hooks.on("renderApplication", (app, html) => {
  const el = html instanceof HTMLElement ? html : html?.[0];
  enhanceCO2SheetDOM(el);
});
