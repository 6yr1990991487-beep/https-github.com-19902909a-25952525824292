/**
 * Personnalisation dédiée de la barre de navigation :
 * palettes, néons animés, style des boutons et des carrousels.
 * ~1200 variations générées (600 "Thèmes" + 600 "Créations").
 */

export type NavBarStyle = "glass" | "solid" | "outline" | "holo" | "frost";
export type NavNeonStyle = "wave" | "pulse" | "chase" | "underline" | "scan" | "aura" | "none";
export type NavBtnStyle = "glass" | "pill" | "solid" | "outline" | "cut" | "neon";
export type NavCarouselStyle = "glass" | "neon" | "minimal" | "frame" | "spotlight";

export type NavSkin = {
  id: string;
  label: string;
  kind: "theme" | "creation";
  family: string;
  accent: string;
  accent2: string;
  accent3: string;
  bar: NavBarStyle;
  neon: NavNeonStyle;
  btn: NavBtnStyle;
  carousel: NavCarouselStyle;
};

export type NavSkinSettings = {
  skinId: string | null;
  bar: NavBarStyle;
  neon: NavNeonStyle;
  btn: NavBtnStyle;
  carousel: NavCarouselStyle;
  speed: number; // 0.4 -> 2.2 (multiplicateur de durée)
  intensity: number; // 0 -> 100
  enabled: boolean;
};

export const NAV_SKIN_KEY = "lovanet:nav-skin-v1";
export const NAV_SKIN_EVENT = "lovanet:nav-skin-change";

export const DEFAULT_NAV_SETTINGS: NavSkinSettings = {
  skinId: null,
  bar: "glass",
  neon: "wave",
  btn: "glass",
  carousel: "glass",
  speed: 1,
  intensity: 62,
  enabled: false,
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const hsl = (h: number, s: number, l: number) => {
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + ((h % 360) + 360) / 30) % 12;
    const c = light - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const FAMILIES: { key: string; label: string; hue: number }[] = [
  { key: "electric-blue", label: "Bleu Électrique", hue: 214 },
  { key: "cyan", label: "Cyan Abyss", hue: 188 },
  { key: "mint", label: "Menthe Cypher", hue: 156 },
  { key: "emerald", label: "Émeraude", hue: 145 },
  { key: "lime", label: "Lime Pulse", hue: 96 },
  { key: "gold", label: "Or Néon", hue: 46 },
  { key: "amber", label: "Ambre", hue: 34 },
  { key: "coral", label: "Corail", hue: 14 },
  { key: "crimson", label: "Cramoisi", hue: 352 },
  { key: "magenta", label: "Magenta", hue: 322 },
  { key: "fuchsia", label: "Fuchsia", hue: 300 },
  { key: "violet", label: "Violet", hue: 274 },
  { key: "indigo", label: "Indigo", hue: 248 },
  { key: "azure", label: "Azur", hue: 202 },
  { key: "teal", label: "Turquoise", hue: 172 },
  { key: "sakura", label: "Sakura", hue: 336 },
  { key: "sunset", label: "Coucher Néon", hue: 22 },
  { key: "ice", label: "Glacier", hue: 196 },
  { key: "toxic", label: "Toxic", hue: 78 },
  { key: "aurora", label: "Aurora", hue: 164 },
  { key: "plasma", label: "Plasma", hue: 288 },
  { key: "ruby", label: "Rubis", hue: 344 },
  { key: "sapphire", label: "Saphir", hue: 228 },
  { key: "jade", label: "Jade", hue: 136 },
  { key: "copper", label: "Cuivre", hue: 26 },
  { key: "steel", label: "Acier", hue: 210 },
  { key: "orchid", label: "Orchidée", hue: 310 },
  { key: "flare", label: "Flare", hue: 8 },
  { key: "lagoon", label: "Lagon", hue: 180 },
  { key: "nebula", label: "Nébuleuse", hue: 262 },
];

type VariantDef = {
  key: string;
  label: string;
  sat: number;
  light: number;
  shift: number;
  bar: NavBarStyle;
  neon: NavNeonStyle;
  btn: NavBtnStyle;
  carousel: NavCarouselStyle;
};

const THEME_VARIANTS: VariantDef[] = [
  { key: "glass", label: "Verre", sat: 88, light: 58, shift: 22, bar: "glass", neon: "wave", btn: "glass", carousel: "glass" },
  { key: "frost", label: "Givre", sat: 72, light: 68, shift: 18, bar: "frost", neon: "aura", btn: "glass", carousel: "glass" },
  { key: "deep", label: "Profond", sat: 94, light: 46, shift: 26, bar: "solid", neon: "pulse", btn: "solid", carousel: "minimal" },
  { key: "soft", label: "Doux", sat: 62, light: 66, shift: 14, bar: "glass", neon: "underline", btn: "pill", carousel: "minimal" },
  { key: "line", label: "Contour", sat: 90, light: 60, shift: 20, bar: "outline", neon: "underline", btn: "outline", carousel: "frame" },
  { key: "holo", label: "Holo", sat: 96, light: 62, shift: 40, bar: "holo", neon: "chase", btn: "neon", carousel: "neon" },
  { key: "studio", label: "Studio", sat: 70, light: 54, shift: 12, bar: "solid", neon: "scan", btn: "cut", carousel: "frame" },
  { key: "vapor", label: "Vapeur", sat: 84, light: 70, shift: 34, bar: "frost", neon: "wave", btn: "pill", carousel: "spotlight" },
  { key: "carbon", label: "Carbone", sat: 58, light: 48, shift: 10, bar: "solid", neon: "none", btn: "cut", carousel: "minimal" },
  { key: "prisme", label: "Prisme", sat: 98, light: 64, shift: 52, bar: "holo", neon: "aura", btn: "neon", carousel: "neon" },
  { key: "satin", label: "Satin", sat: 66, light: 60, shift: 16, bar: "glass", neon: "aura", btn: "glass", carousel: "glass" },
  { key: "chrome", label: "Chrome", sat: 44, light: 72, shift: 8, bar: "frost", neon: "scan", btn: "outline", carousel: "frame" },
  { key: "pulse", label: "Pulsar", sat: 92, light: 56, shift: 28, bar: "glass", neon: "pulse", btn: "neon", carousel: "spotlight" },
  { key: "night", label: "Nuit", sat: 78, light: 40, shift: 24, bar: "solid", neon: "underline", btn: "solid", carousel: "minimal" },
  { key: "bloom", label: "Bloom", sat: 86, light: 66, shift: 36, bar: "glass", neon: "aura", btn: "pill", carousel: "spotlight" },
  { key: "grid", label: "Grille", sat: 74, light: 52, shift: 18, bar: "outline", neon: "chase", btn: "outline", carousel: "frame" },
  { key: "aqua", label: "Aqua", sat: 80, light: 62, shift: 30, bar: "frost", neon: "wave", btn: "glass", carousel: "glass" },
  { key: "flux", label: "Flux", sat: 90, light: 58, shift: 44, bar: "holo", neon: "scan", btn: "neon", carousel: "neon" },
  { key: "mono", label: "Mono", sat: 30, light: 62, shift: 4, bar: "outline", neon: "none", btn: "outline", carousel: "minimal" },
  { key: "royal", label: "Royal", sat: 88, light: 50, shift: 20, bar: "solid", neon: "aura", btn: "solid", carousel: "spotlight" },
];

const CREATION_VARIANTS: VariantDef[] = [
  { key: "neon-anime", label: "Néon Animé", sat: 100, light: 60, shift: 30, bar: "glass", neon: "wave", btn: "neon", carousel: "neon" },
  { key: "neon-chase", label: "Néon Serpentin", sat: 100, light: 58, shift: 36, bar: "glass", neon: "chase", btn: "neon", carousel: "neon" },
  { key: "neon-pulse", label: "Néon Pulsé", sat: 100, light: 56, shift: 24, bar: "solid", neon: "pulse", btn: "neon", carousel: "spotlight" },
  { key: "neon-scan", label: "Néon Scanner", sat: 98, light: 62, shift: 42, bar: "holo", neon: "scan", btn: "neon", carousel: "neon" },
  { key: "neon-under", label: "Néon Souligné", sat: 96, light: 60, shift: 18, bar: "outline", neon: "underline", btn: "outline", carousel: "frame" },
  { key: "neon-aura", label: "Néon Aura", sat: 96, light: 64, shift: 28, bar: "frost", neon: "aura", btn: "neon", carousel: "spotlight" },
  { key: "cyber-run", label: "Cyber Run", sat: 100, light: 54, shift: 48, bar: "holo", neon: "chase", btn: "cut", carousel: "neon" },
  { key: "hologrid", label: "Holo Grid", sat: 94, light: 66, shift: 54, bar: "holo", neon: "scan", btn: "outline", carousel: "frame" },
  { key: "laser", label: "Laser", sat: 100, light: 52, shift: 12, bar: "solid", neon: "chase", btn: "neon", carousel: "neon" },
  { key: "glowdrop", label: "Glow Drop", sat: 92, light: 68, shift: 32, bar: "glass", neon: "aura", btn: "pill", carousel: "spotlight" },
  { key: "arcade", label: "Arcade", sat: 100, light: 58, shift: 60, bar: "solid", neon: "pulse", btn: "cut", carousel: "neon" },
  { key: "synthwave", label: "Synthwave", sat: 98, light: 60, shift: 66, bar: "holo", neon: "wave", btn: "neon", carousel: "spotlight" },
  { key: "vaporlane", label: "Vapor Lane", sat: 90, light: 70, shift: 38, bar: "frost", neon: "wave", btn: "pill", carousel: "glass" },
  { key: "circuit", label: "Circuit", sat: 88, light: 56, shift: 16, bar: "outline", neon: "chase", btn: "outline", carousel: "frame" },
  { key: "reactor", label: "Réacteur", sat: 100, light: 50, shift: 20, bar: "solid", neon: "pulse", btn: "solid", carousel: "spotlight" },
  { key: "spectra", label: "Spectra", sat: 96, light: 62, shift: 72, bar: "holo", neon: "aura", btn: "neon", carousel: "neon" },
  { key: "ionic", label: "Ionique", sat: 94, light: 64, shift: 26, bar: "glass", neon: "scan", btn: "glass", carousel: "glass" },
  { key: "afterburn", label: "Afterburn", sat: 100, light: 55, shift: 10, bar: "glass", neon: "chase", btn: "neon", carousel: "spotlight" },
  { key: "midnight-neon", label: "Néon Minuit", sat: 92, light: 44, shift: 22, bar: "solid", neon: "underline", btn: "neon", carousel: "minimal" },
  { key: "starlane", label: "Star Lane", sat: 90, light: 68, shift: 50, bar: "frost", neon: "wave", btn: "glass", carousel: "spotlight" },
];

const build = (): NavSkin[] => {
  const out: NavSkin[] = [];
  for (const family of FAMILIES) {
    for (const [kind, variants] of [
      ["theme", THEME_VARIANTS],
      ["creation", CREATION_VARIANTS],
    ] as const) {
      for (const v of variants) {
        out.push({
          id: `${family.key}-${kind}-${v.key}`,
          label: `${family.label} · ${v.label}`,
          kind,
          family: family.label,
          accent: hsl(family.hue, v.sat, v.light),
          accent2: hsl(family.hue + v.shift, v.sat, clamp(v.light + 6, 20, 86)),
          accent3: hsl(family.hue - v.shift * 0.7, clamp(v.sat - 8, 20, 100), clamp(v.light - 6, 16, 84)),
          bar: v.bar,
          neon: v.neon,
          btn: v.btn,
          carousel: v.carousel,
        });
      }
    }
  }
  return out;
};

export const NAV_SKINS: NavSkin[] = build();

export const findNavSkin = (id: string | null) => (id ? NAV_SKINS.find((s) => s.id === id) ?? null : null);

export const readNavSettings = (): NavSkinSettings => {
  if (typeof window === "undefined") return DEFAULT_NAV_SETTINGS;
  try {
    const raw = window.localStorage.getItem(NAV_SKIN_KEY);
    if (!raw) return DEFAULT_NAV_SETTINGS;
    return { ...DEFAULT_NAV_SETTINGS, ...(JSON.parse(raw) as Partial<NavSkinSettings>) };
  } catch {
    return DEFAULT_NAV_SETTINGS;
  }
};

export const applyNavSkin = (settings: NavSkinSettings) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const ds = root.dataset;

  if (!settings.enabled) {
    delete ds.navSkin;
    delete ds.navBar;
    delete ds.navNeon;
    delete ds.navBtn;
    delete ds.navCarousel;
    root.style.removeProperty("--nav-skin-accent");
    root.style.removeProperty("--nav-skin-accent-2");
    root.style.removeProperty("--nav-skin-accent-3");
    root.style.removeProperty("--nav-fx-speed");
    root.style.removeProperty("--nav-fx-intensity");
    return;
  }

  const skin = findNavSkin(settings.skinId);
  if (skin) {
    root.style.setProperty("--nav-skin-accent", skin.accent);
    root.style.setProperty("--nav-skin-accent-2", skin.accent2);
    root.style.setProperty("--nav-skin-accent-3", skin.accent3);
    root.style.setProperty("--nav-theme-accent", skin.accent);
    root.style.setProperty("--nav-theme-accent-2", skin.accent2);
    root.style.setProperty("--nav-theme-accent-3", skin.accent3);
    ds.navSkin = skin.id;
  }

  ds.navBar = settings.bar;
  ds.navNeon = settings.neon;
  ds.navBtn = settings.btn;
  ds.navCarousel = settings.carousel;
  root.style.setProperty("--nav-fx-speed", `${clamp(settings.speed, 0.4, 2.2)}`);
  root.style.setProperty("--nav-fx-intensity", `${clamp(settings.intensity, 0, 100) / 100}`);
};

export const saveNavSettings = (settings: NavSkinSettings) => {
  try {
    window.localStorage.setItem(NAV_SKIN_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
  applyNavSkin(settings);
  window.dispatchEvent(new CustomEvent(NAV_SKIN_EVENT, { detail: settings }));
};

export const initNavSkin = () => applyNavSkin(readNavSettings());

export const reapplyNavSkin = initNavSkin;
