import { useEffect, useState } from "react";
import { Palette, X } from "lucide-react";

/**
 * Floating bubble (bottom-right). Two rows:
 *  1. Ambiance presets (multi-tone gradient themes)
 *  2. Accent colors (strong solid tint applied to background + borders + primary)
 *
 * The accent paints the WHOLE site background with a strong tinted color
 * (not just a faint glow on black), and also colors borders, primary, ring.
 * Choice persists in localStorage.
 */

type ThemeKey = "default" | "midnight" | "sunset" | "forest" | "candy";

type Theme = {
  key: ThemeKey;
  label: string;
  swatch: string;
  // HSL component strings (no hsl() wrapper)
  background: string;
  card: string;
  border: string;
  primary: string;
  hero: string;
};

const THEMES: Theme[] = [
  {
    key: "default",
    label: "Anime Night",
    swatch: "linear-gradient(135deg,#3b82f6,#ec4899)",
    background: "220 30% 8%",
    card: "220 25% 11%",
    border: "220 20% 18%",
    primary: "211 100% 55%",
    hero: "linear-gradient(135deg,hsl(220 35% 6%) 0%,hsl(220 30% 10%) 50%,hsl(220 25% 14%) 100%)",
  },
  {
    key: "midnight",
    label: "Midnight Indigo",
    swatch: "linear-gradient(135deg,#0a0a1a,#4f46e5)",
    background: "245 45% 7%",
    card: "245 40% 11%",
    border: "245 30% 20%",
    primary: "250 95% 68%",
    hero: "linear-gradient(135deg,hsl(245 50% 5%) 0%,hsl(250 45% 11%) 50%,hsl(260 40% 16%) 100%)",
  },
  {
    key: "sunset",
    label: "Sunset Blaze",
    swatch: "linear-gradient(135deg,#ff6b35,#e84393)",
    background: "18 50% 8%",
    card: "16 45% 12%",
    border: "14 35% 22%",
    primary: "20 95% 60%",
    hero: "linear-gradient(135deg,hsl(18 55% 6%) 0%,hsl(340 45% 11%) 50%,hsl(280 40% 16%) 100%)",
  },
  {
    key: "forest",
    label: "Forest Moss",
    swatch: "linear-gradient(135deg,#1a3c2a,#a0c49d)",
    background: "150 35% 7%",
    card: "150 30% 11%",
    border: "150 25% 20%",
    primary: "150 70% 50%",
    hero: "linear-gradient(135deg,hsl(150 40% 5%) 0%,hsl(155 35% 10%) 50%,hsl(170 30% 14%) 100%)",
  },
  {
    key: "candy",
    label: "Candy Pop",
    swatch: "linear-gradient(135deg,#67e8f9,#c4b5fd)",
    background: "260 35% 10%",
    card: "260 30% 14%",
    border: "260 25% 24%",
    primary: "320 90% 65%",
    hero: "linear-gradient(135deg,hsl(200 70% 12%) 0%,hsl(260 60% 16%) 50%,hsl(320 60% 18%) 100%)",
  },
];

const STORAGE_KEY = "lovanet:theme";
const ACCENT_STORAGE_KEY = "lovanet:accent";

/**
 * Accent colors. Each repaints the ENTIRE site (background, surfaces,
 * borders, primary). "tone" decides whether the background is a deep
 * tinted dark, a pure black, or a pure white sheet.
 */
type Tone = "dark" | "black" | "white";
type Accent = {
  key: string;
  label: string;
  swatch: string;
  hue: number; // 0-360
  sat: number; // 0-100
  tone: Tone;
  /** Optional custom backdrop (CSS background). Overrides the computed tint. */
  customTint?: string;
  /** When true, swatch swirls (animated gradient preview). */
  animated?: boolean;
};

const ACCENTS: Accent[] = [
  { key: "off",     label: "Aucune",   swatch: "linear-gradient(135deg,#333,#666)", hue: 0,   sat: 0,  tone: "dark"  },
  { key: "black",   label: "Noir pur", swatch: "#000",     hue: 0,   sat: 0,  tone: "black" },
  { key: "white",   label: "Blanc",    swatch: "#fff",     hue: 0,   sat: 0,  tone: "white" },
  { key: "red",     label: "Rouge",    swatch: "#ef4444",  hue: 0,   sat: 85, tone: "dark"  },
  { key: "orange",  label: "Orange",   swatch: "#f97316",  hue: 24,  sat: 90, tone: "dark"  },
  { key: "yellow",  label: "Jaune",    swatch: "#eab308",  hue: 45,  sat: 90, tone: "dark"  },
  { key: "green",   label: "Vert",     swatch: "#22c55e",  hue: 142, sat: 75, tone: "dark"  },
  { key: "cyan",    label: "Cyan",     swatch: "#06b6d4",  hue: 188, sat: 90, tone: "dark"  },
  { key: "blue",    label: "Bleu",     swatch: "#3b82f6",  hue: 217, sat: 90, tone: "dark"  },
  { key: "purple",  label: "Violet",   swatch: "#8b5cf6",  hue: 262, sat: 85, tone: "dark"  },
  { key: "pink",    label: "Rose",     swatch: "#ec4899",  hue: 328, sat: 85, tone: "dark"  },

  // ---- 18 nuances simples (pastels / classiques) ----
  { key: "ivory",    label: "Ivoire",    swatch: "#fffbe6", hue: 50,  sat: 30, tone: "white" },
  { key: "cream",    label: "Crème",     swatch: "#f5e6c8", hue: 38,  sat: 40, tone: "dark"  },
  { key: "sand",     label: "Sable",     swatch: "#d4b483", hue: 36,  sat: 50, tone: "dark"  },
  { key: "taupe",    label: "Taupe",     swatch: "#8b7355", hue: 30,  sat: 30, tone: "dark"  },
  { key: "coral",    label: "Corail",    swatch: "#ff7f6b", hue: 8,   sat: 80, tone: "dark"  },
  { key: "salmon",   label: "Saumon",    swatch: "#fa8072", hue: 6,   sat: 70, tone: "dark"  },
  { key: "rose",     label: "Rose pâle", swatch: "#f9c0d9", hue: 335, sat: 60, tone: "dark"  },
  { key: "lavender", label: "Lavande",   swatch: "#b497d6", hue: 270, sat: 55, tone: "dark"  },
  { key: "mint",     label: "Menthe",    swatch: "#98ddca", hue: 160, sat: 55, tone: "dark"  },
  { key: "sage",     label: "Sauge",     swatch: "#9caf88", hue: 90,  sat: 35, tone: "dark"  },
  { key: "olive",    label: "Olive",     swatch: "#808000", hue: 60,  sat: 80, tone: "dark"  },
  { key: "teal",     label: "Sarcelle",  swatch: "#008080", hue: 180, sat: 90, tone: "dark"  },
  { key: "navy",     label: "Marine",    swatch: "#1e3a8a", hue: 226, sat: 75, tone: "dark"  },
  { key: "indigo",   label: "Indigo",    swatch: "#4338ca", hue: 244, sat: 75, tone: "dark"  },
  { key: "plum",     label: "Prune",     swatch: "#6b2c5e", hue: 313, sat: 55, tone: "dark"  },
  { key: "burgundy", label: "Bordeaux",  swatch: "#800020", hue: 345, sat: 95, tone: "dark"  },
  { key: "brown",    label: "Brun",      swatch: "#6f4e37", hue: 24,  sat: 50, tone: "dark"  },
  { key: "slate",    label: "Ardoise",   swatch: "#475569", hue: 215, sat: 25, tone: "dark"  },

  // ---- 15 fluo / néon vifs ----
  { key: "fluo-pink",   label: "Fluo Rose",   swatch: "#ff00d4", hue: 320, sat: 100, tone: "dark" },
  { key: "fluo-green",  label: "Fluo Vert",   swatch: "#39ff14", hue: 113, sat: 100, tone: "dark" },
  { key: "fluo-yellow", label: "Fluo Jaune",  swatch: "#ffff33", hue: 60,  sat: 100, tone: "dark" },
  { key: "fluo-orange", label: "Fluo Orange", swatch: "#ff6700", hue: 24,  sat: 100, tone: "dark" },
  { key: "fluo-cyan",   label: "Fluo Cyan",   swatch: "#00ffff", hue: 180, sat: 100, tone: "dark" },
  { key: "fluo-blue",   label: "Fluo Bleu",   swatch: "#1f51ff", hue: 224, sat: 100, tone: "dark" },
  { key: "fluo-purple", label: "Fluo Violet", swatch: "#bf00ff", hue: 285, sat: 100, tone: "dark" },
  { key: "fluo-red",    label: "Fluo Rouge",  swatch: "#ff073a", hue: 351, sat: 100, tone: "dark" },
  { key: "fluo-lime",   label: "Fluo Lime",   swatch: "#ccff00", hue: 72,  sat: 100, tone: "dark" },
  { key: "fluo-magenta",label: "Fluo Magenta",swatch: "#ff00ff", hue: 300, sat: 100, tone: "dark" },
  { key: "fluo-mint",   label: "Fluo Menthe", swatch: "#00ff9f", hue: 158, sat: 100, tone: "dark" },
  { key: "fluo-peach",  label: "Fluo Pêche",  swatch: "#ff9966", hue: 18,  sat: 100, tone: "dark" },
  { key: "fluo-sky",    label: "Fluo Ciel",   swatch: "#7df9ff", hue: 184, sat: 100, tone: "dark" },
  { key: "fluo-violet", label: "Fluo Vio.",   swatch: "#9d00ff", hue: 277, sat: 100, tone: "dark" },
  { key: "fluo-gold",   label: "Fluo Or",     swatch: "#ffd700", hue: 51,  sat: 100, tone: "dark" },

  // ---- 12 dégradés animés ----
  ...([
    { k: "anim-rgb",     l: "RGB",        g: "linear-gradient(135deg,#ff0080,#7928ca,#0070f3,#00d4ff,#39ff14,#ffd700,#ff0080)" },
    { k: "anim-aurora",  l: "Aurore",     g: "linear-gradient(135deg,#00c9ff,#92fe9d,#fc466b,#3f5efb,#00c9ff)" },
    { k: "anim-sunset",  l: "Couché",     g: "linear-gradient(135deg,#ff6e7f,#bfe9ff,#ff9966,#ff5e62,#ff6e7f)" },
    { k: "anim-ocean",   l: "Océan",      g: "linear-gradient(135deg,#2e3192,#1bffff,#0f2027,#2c5364,#2e3192)" },
    { k: "anim-candy",   l: "Bonbon",     g: "linear-gradient(135deg,#ff9a9e,#fad0c4,#fbc2eb,#a18cd1,#ff9a9e)" },
    { k: "anim-jungle",  l: "Jungle",     g: "linear-gradient(135deg,#134e5e,#71b280,#a8e063,#56ab2f,#134e5e)" },
    { k: "anim-fire",    l: "Feu",        g: "linear-gradient(135deg,#f12711,#f5af19,#ff512f,#dd2476,#f12711)" },
    { k: "anim-ice",     l: "Glace",      g: "linear-gradient(135deg,#83a4d4,#b6fbff,#a1c4fd,#c2e9fb,#83a4d4)" },
    { k: "anim-galaxy",  l: "Galaxie",    g: "linear-gradient(135deg,#0f0c29,#302b63,#24243e,#7f00ff,#0f0c29)" },
    { k: "anim-neon",    l: "Néon",       g: "linear-gradient(135deg,#fc00ff,#00dbde,#ff00aa,#00ff88,#fc00ff)" },
    { k: "anim-vapor",   l: "Vaporwave",  g: "linear-gradient(135deg,#ff71ce,#01cdfe,#05ffa1,#b967ff,#ff71ce)" },
    { k: "anim-rainbow", l: "Arc-en-ciel",g: "linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#9400d3,#ff0000)" },
  ].map((x) => ({
    key: x.k, label: x.l, swatch: x.g, hue: 0, sat: 0, tone: "dark" as Tone,
    customTint: x.g, animated: true,
  }))),
];

const applyTheme = (t: Theme) => {
  const r = document.documentElement.style;
  r.setProperty("--background", t.background);
  r.setProperty("--card", t.card);
  r.setProperty("--popover", t.card);
  r.setProperty("--secondary", t.card);
  r.setProperty("--muted", t.card);
  r.setProperty("--border", t.border);
  r.setProperty("--input", t.border);
  r.setProperty("--primary", t.primary);
  r.setProperty("--accent", t.primary);
  r.setProperty("--ring", t.primary);
  r.setProperty("--gradient-hero", t.hero);
};

/**
 * Paint the entire site with a strong color tint.
 * - "dark" tone: deep saturated dark of the hue (e.g. crimson, forest...)
 * - "black" tone: pure black backdrop, white text, white borders
 * - "white" tone: pure white backdrop, dark text, dark borders
 * Also sets a strong body backdrop gradient via --site-tint so the color
 * is felt across the whole page, not just as a faint glow.
 */
const applyAccent = (a: Accent) => {
  const r = document.documentElement.style;

  if (a.key === "off") {
    // Clear accent overrides — let the active Theme show through.
    [
      "--background", "--foreground", "--card", "--card-foreground",
      "--popover", "--popover-foreground", "--secondary", "--muted",
      "--muted-foreground", "--border", "--input", "--primary",
      "--primary-foreground", "--accent", "--accent-foreground",
      "--ring", "--site-tint",
    ].forEach((v) => r.removeProperty(v));
    document.body.style.removeProperty("background");
    document.body.style.removeProperty("background-color");
    return;
  }

  let bg: string, card: string, border: string, primary: string, fg: string, primaryFg: string, mutedFg: string, tint: string;

  if (a.tone === "black") {
    bg = "0 0% 0%";
    card = "0 0% 6%";
    border = "0 0% 22%";
    primary = "0 0% 100%";
    fg = "0 0% 98%";
    primaryFg = "0 0% 0%";
    mutedFg = "0 0% 70%";
    tint = "radial-gradient(1200px 800px at 20% 0%, hsl(0 0% 8%) 0%, hsl(0 0% 0%) 60%), #000";
  } else if (a.tone === "white") {
    bg = "0 0% 100%";
    card = "0 0% 97%";
    border = "0 0% 80%";
    primary = "0 0% 0%";
    fg = "0 0% 8%";
    primaryFg = "0 0% 100%";
    mutedFg = "0 0% 30%";
    tint = "radial-gradient(1200px 800px at 20% 0%, hsl(0 0% 96%) 0%, hsl(0 0% 100%) 60%), #fff";
  } else {
    // Deep saturated dark of the hue — the color is FELT everywhere.
    bg = `${a.hue} ${a.sat}% 10%`;
    card = `${a.hue} ${Math.min(a.sat, 70)}% 14%`;
    border = `${a.hue} ${a.sat}% 38%`;
    primary = `${a.hue} ${Math.min(100, a.sat + 5)}% 58%`;
    fg = "0 0% 98%";
    primaryFg = "0 0% 100%";
    mutedFg = `${a.hue} 25% 78%`;
    tint = `radial-gradient(1200px 900px at 15% -10%, hsl(${a.hue} ${a.sat}% 28%) 0%, hsl(${a.hue} ${a.sat}% 12%) 45%, hsl(${a.hue} ${Math.max(20, a.sat - 20)}% 6%) 100%)`;
  }

  // Custom override (animated gradients)
  if (a.customTint) {
    tint = a.customTint;
  }

  // Fluo colors: force a vibrant, strongly-lit backdrop so the color
  // is actually felt on the whole page (not just a faint dark wash).
  if (a.key.startsWith("fluo-")) {
    const hex = a.swatch;
    bg = `${a.hue} 100% 12%`;
    border = `${a.hue} 100% 55%`;
    primary = `${a.hue} 100% 60%`;
    tint = `radial-gradient(1400px 1000px at 15% -10%, ${hex} 0%, ${hex}cc 25%, hsl(${a.hue} 90% 18%) 60%, hsl(${a.hue} 80% 8%) 100%)`;
  }

  r.setProperty("--background", bg);
  r.setProperty("--foreground", fg);
  r.setProperty("--card", card);
  r.setProperty("--card-foreground", fg);
  r.setProperty("--popover", card);
  r.setProperty("--popover-foreground", fg);
  r.setProperty("--secondary", card);
  r.setProperty("--muted", card);
  r.setProperty("--muted-foreground", mutedFg);
  r.setProperty("--border", border);
  r.setProperty("--input", border);
  r.setProperty("--primary", primary);
  r.setProperty("--primary-foreground", primaryFg);
  r.setProperty("--accent", primary);
  r.setProperty("--accent-foreground", primaryFg);
  r.setProperty("--ring", primary);
  r.setProperty("--site-tint", tint);
  // Make the hero overlay inherit the tint instead of the dark default,
  // otherwise the Index hero gradient hides the chosen color.
  r.setProperty("--gradient-hero", tint);

  // Paint the body itself so the tint reaches every page corner.
  document.body.style.background = tint;
  document.body.style.backgroundAttachment = "fixed";
  if (a.animated) {
    document.body.style.backgroundSize = "400% 400%";
    document.body.style.animation = "lovanet-bg-shift 18s ease infinite";
  } else {
    document.body.style.backgroundSize = "";
    document.body.style.animation = "";
  }
};

export const ThemeBubble = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeKey>("default");
  const [accent, setAccent] = useState<string>("off");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeKey | null) ?? "default";
    const t = THEMES.find((x) => x.key === saved) ?? THEMES[0];
    applyTheme(t);
    setActive(t.key);

    // Default to transparent theme background on first visit so the menu's
    // glassmorphism and the page background share the same dark family.
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) ?? "off";
    const a = ACCENTS.find((x) => x.key === savedAccent) ?? ACCENTS.find((x) => x.key === "off")!;
    applyAccent(a);
    setAccent(a.key);
  }, []);

  const pick = (t: Theme) => {
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t.key);
    setActive(t.key);
    // Re-apply accent on top if one is active, so it overrides the preset.
    const a = ACCENTS.find((x) => x.key === accent);
    if (a && a.key !== "off") applyAccent(a);
  };

  const pickAccent = (a: Accent) => {
    applyAccent(a);
    localStorage.setItem(ACCENT_STORAGE_KEY, a.key);
    setAccent(a.key);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-3 shadow-2xl animate-scale-in w-[260px]">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 px-1">
            Ambiance
          </p>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => pick(t)}
                title={t.label}
                aria-label={t.label}
                className={`relative w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                  active === t.key && accent === "off"
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                    : ""
                }`}
                style={{ background: t.swatch }}
              />
            ))}
          </div>

          <div className="h-px bg-border/60 my-3" />

          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 px-1">
            Couleur du fond
          </p>
          <div className="grid grid-cols-6 gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => pickAccent(a)}
                title={a.label}
                aria-label={a.label}
                className={`relative w-9 h-9 rounded-full border border-border/60 transition-transform hover:scale-110 ${
                  accent === a.key ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                }`}
                style={{ background: a.swatch }}
              >
                {a.key === "off" && (
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] text-muted-foreground">
                    OFF
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            {accent !== "off"
              ? `Fond : ${ACCENTS.find((a) => a.key === accent)?.label}`
              : THEMES.find((t) => t.key === active)?.label}
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Personnaliser le thème"
        className="relative w-14 h-14 rounded-full shadow-[0_10px_30px_hsl(var(--primary)/0.45)] border border-border bg-card/90 backdrop-blur-xl hover:scale-110 transition-all flex items-center justify-center group overflow-hidden"
      >
        <span
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "conic-gradient(from 0deg,#ff2e93,#ffb13a,#06d6a0,#3a86ff,#8338ec,#ff2e93)",
          }}
        />
        <span className="relative z-10 text-white drop-shadow">
          {open ? <X className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
        </span>
      </button>
    </div>
  );
};

export default ThemeBubble;