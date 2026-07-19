import { useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";

type ThemeKey = "default" | "midnight" | "sunset" | "forest" | "candy";

type Theme = {
  key: ThemeKey;
  label: string;
  swatch: string;
  background: string;
  card: string;
  border: string;
  primary: string;
  hero: string;
};

const THEMES: Theme[] = [
  { key: "default", label: "Anime Night", swatch: "linear-gradient(135deg,#3b82f6,#ec4899)", background: "220 30% 8%", card: "220 25% 11%", border: "220 20% 18%", primary: "211 100% 55%", hero: "linear-gradient(135deg,hsl(220 35% 6%) 0%,hsl(220 30% 10%) 50%,hsl(220 25% 14%) 100%)" },
  { key: "midnight", label: "Midnight Indigo", swatch: "linear-gradient(135deg,#0a0a1a,#4f46e5)", background: "245 45% 7%", card: "245 40% 11%", border: "245 30% 20%", primary: "250 95% 68%", hero: "linear-gradient(135deg,hsl(245 50% 5%) 0%,hsl(250 45% 11%) 50%,hsl(260 40% 16%) 100%)" },
  { key: "sunset", label: "Sunset Blaze", swatch: "linear-gradient(135deg,#ff6b35,#e84393)", background: "18 50% 8%", card: "16 45% 12%", border: "14 35% 22%", primary: "20 95% 60%", hero: "linear-gradient(135deg,hsl(18 55% 6%) 0%,hsl(340 45% 11%) 50%,hsl(280 40% 16%) 100%)" },
  { key: "forest", label: "Forest Moss", swatch: "linear-gradient(135deg,#1a3c2a,#a0c49d)", background: "150 35% 7%", card: "150 30% 11%", border: "150 25% 20%", primary: "150 70% 50%", hero: "linear-gradient(135deg,hsl(150 40% 5%) 0%,hsl(155 35% 10%) 50%,hsl(170 30% 14%) 100%)" },
  { key: "candy", label: "Candy Pop", swatch: "linear-gradient(135deg,#67e8f9,#c4b5fd)", background: "260 35% 10%", card: "260 30% 14%", border: "260 25% 24%", primary: "320 90% 65%", hero: "linear-gradient(135deg,hsl(200 70% 12%) 0%,hsl(260 60% 16%) 50%,hsl(320 60% 18%) 100%)" },
];

const STORAGE_KEY = "lovanet:theme";
const ACCENT_STORAGE_KEY = "lovanet:accent";

type Tone = "dark" | "black" | "white";
type Accent = { key: string; label: string; swatch: string; hue: number; sat: number; tone: Tone; customTint?: string; animated?: boolean; };

const ACCENTS: Accent[] = [
  { key: "off", label: "Aucune", swatch: "linear-gradient(135deg,#333,#666)", hue: 0, sat: 0, tone: "dark" },
  { key: "black", label: "Noir pur", swatch: "#000", hue: 0, sat: 0, tone: "black" },
  { key: "white", label: "Blanc", swatch: "#fff", hue: 0, sat: 0, tone: "white" },
  { key: "red", label: "Rouge", swatch: "#ef4444", hue: 0, sat: 85, tone: "dark" },
  { key: "orange", label: "Orange", swatch: "#f97316", hue: 24, sat: 90, tone: "dark" },
  { key: "yellow", label: "Jaune", swatch: "#eab308", hue: 45, sat: 90, tone: "dark" },
  { key: "green", label: "Vert", swatch: "#22c55e", hue: 142, sat: 75, tone: "dark" },
  { key: "cyan", label: "Cyan", swatch: "#06b6d4", hue: 188, sat: 90, tone: "dark" },
  { key: "blue", label: "Bleu", swatch: "#3b82f6", hue: 217, sat: 90, tone: "dark" },
  { key: "purple", label: "Violet", swatch: "#8b5cf6", hue: 262, sat: 85, tone: "dark" },
  { key: "pink", label: "Rose", swatch: "#ec4899", hue: 328, sat: 85, tone: "dark" },
  ...([
    { k: "anim-rgb", l: "RGB", g: "linear-gradient(135deg,#ff0080,#7928ca,#0070f3,#00d4ff,#39ff14,#ffd700,#ff0080)" },
    { k: "anim-aurora", l: "Aurore", g: "linear-gradient(135deg,#00c9ff,#92fe9d,#fc466b,#3f5efb,#00c9ff)" },
    { k: "anim-neon", l: "Néon", g: "linear-gradient(135deg,#fc00ff,#00dbde,#ff00aa,#00ff88,#fc00ff)" },
  ].map((x) => ({ key: x.k, label: x.l, swatch: x.g, hue: 0, sat: 0, tone: "dark" as Tone, customTint: x.g, animated: true }))),
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

const applyAccent = (a: Accent) => {
  const r = document.documentElement.style;
  if (a.key === "off") {
    ["--background", "--foreground", "--card", "--card-foreground", "--popover", "--popover-foreground", "--secondary", "--muted", "--muted-foreground", "--border", "--input", "--primary", "--primary-foreground", "--accent", "--accent-foreground", "--ring", "--site-tint"].forEach((v) => r.removeProperty(v));
    document.body.style.removeProperty("background");
    document.body.style.removeProperty("background-color");
    return;
  }

  let bg = `${a.hue} ${a.sat}% 10%`;
  let card = `${a.hue} ${Math.min(a.sat, 70)}% 14%`;
  let border = `${a.hue} ${a.sat}% 38%`;
  let primary = `${a.hue} ${Math.min(100, a.sat + 5)}% 58%`;
  let fg = "0 0% 98%";
  let primaryFg = "0 0% 100%";
  let mutedFg = `${a.hue} 25% 78%`;
  let tint = `radial-gradient(1200px 900px at 15% -10%, hsl(${a.hue} ${a.sat}% 28%) 0%, hsl(${a.hue} ${a.sat}% 12%) 45%, hsl(${a.hue} ${Math.max(20, a.sat - 20)}% 6%) 100%)`;

  if (a.customTint) tint = a.customTint;

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
  r.setProperty("--gradient-hero", tint);

  document.body.style.background = tint;
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundSize = a.animated ? "400% 400%" : "";
  document.body.style.animation = a.animated ? "lovanet-bg-shift 18s ease infinite" : "";
};

const SHAPES = [
  { key: "ring", viewBox: "0 0 64 64", element: <><circle cx="32" cy="32" r="18" /><circle cx="32" cy="32" r="9" /><path d="M32 6v8M32 50v8M6 32h8M50 32h8" /></> },
  { key: "crystal", viewBox: "0 0 64 64", element: <path d="M32 6 46 18 42 42 32 58 22 42 18 18Z" /> },
  { key: "diamond", viewBox: "0 0 64 64", element: <path d="M32 8 54 32 32 56 10 32Z" /> },
  { key: "target", viewBox: "0 0 64 64", element: <><circle cx="32" cy="32" r="21" /><circle cx="32" cy="32" r="13" /><circle cx="32" cy="32" r="4" /></> },
  { key: "hex-star", viewBox: "0 0 64 64", element: <path d="M32 7 41 19 56 22 46 33 48 48 32 41 16 48 18 33 8 22 23 19Z" /> },
  { key: "orbit", viewBox: "0 0 64 64", element: <><ellipse cx="32" cy="32" rx="21" ry="8" /><ellipse cx="32" cy="32" rx="8" ry="21" /><circle cx="32" cy="32" r="5" /></> },
  { key: "prism", viewBox: "0 0 64 64", element: <path d="M20 14h24l8 18-20 18L12 32Z" /> },
  { key: "comet", viewBox: "0 0 64 64", element: <><path d="M14 34h22" /><path d="M10 28h16" /><path d="M18 40h12" /><circle cx="42" cy="24" r="9" /></> },
];

const AnimatedThemeGlyph = ({ active }: { active: boolean }) => {
  const [shapeIndex, setShapeIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setShapeIndex((i) => (i + 1) % SHAPES.length), 1400);
    return () => window.clearInterval(id);
  }, []);

  const rotation = useMemo(() => `${shapeIndex * 45}deg`, [shapeIndex]);

  return (
    <div className="relative z-10 flex h-8 w-8 items-center justify-center" data-testid="theme-bubble-animated-glyph">
      <span className="absolute inset-0 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-xl" style={{ boxShadow: active ? "0 0 24px rgba(34,211,238,0.35), 0 0 32px rgba(232,121,249,0.28), inset 0 1px 0 rgba(255,255,255,0.18)" : "0 0 18px rgba(34,211,238,0.22), 0 0 24px rgba(232,121,249,0.18), inset 0 1px 0 rgba(255,255,255,0.15)" }} />
      <span className="absolute inset-[4px] rounded-full" style={{ background: "conic-gradient(from 0deg,#ff4fd8,#7c3aed,#22d3ee,#fbbf24,#ff4fd8)", filter: "blur(8px)", opacity: active ? 0.8 : 0.65, animation: "lovanet-glyph-spin 8s linear infinite" }} />
      <span className="absolute inset-[7px] rounded-full border border-white/10 bg-[rgba(8,6,18,0.82)]" style={{ transform: `rotate(${rotation})` }} />
      {SHAPES.map((shape, index) => (
        <svg key={shape.key} viewBox={shape.viewBox} className="absolute h-6 w-6 transition-all duration-700" style={{ opacity: shapeIndex === index ? 1 : 0, transform: `scale(${shapeIndex === index ? 1 : 0.7}) rotate(${shapeIndex === index ? 0 : -24}deg)`, filter: shapeIndex === index ? "drop-shadow(0 0 8px rgba(34,211,238,0.45)) drop-shadow(0 0 10px rgba(232,121,249,0.35))" : "none" }} fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{shape.element}</svg>
      ))}
      <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-white/80" />
    </div>
  );
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

    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) ?? "off";
    const a = ACCENTS.find((x) => x.key === savedAccent) ?? ACCENTS.find((x) => x.key === "off");
    if (a) {
      applyAccent(a);
      setAccent(a.key);
    }
  }, []);

  const pick = (t: Theme) => {
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t.key);
    setActive(t.key);
    const a = ACCENTS.find((x) => x.key === accent);
    if (a && a.key !== "off") applyAccent(a);
  };

  const pickAccent = (a: Accent) => {
    applyAccent(a);
    localStorage.setItem(ACCENT_STORAGE_KEY, a.key);
    setAccent(a.key);
  };

  return (
    <div className="fixed left-4 top-1/2 z-[70] flex -translate-y-1/2 items-center gap-3 md:left-5" data-testid="theme-bubble-shell">
      {open && (
        <div className="w-[300px] rounded-[1.75rem] border border-white/15 bg-[rgba(9,7,20,0.84)] p-4 shadow-[0_24px_80px_-26px_rgba(0,0,0,0.7),0_0_34px_rgba(34,211,238,0.12),0_0_34px_rgba(232,121,249,0.1)] backdrop-blur-2xl animate-scale-in" data-testid="theme-bubble-panel">
          <p className="mb-3 px-1 text-[10px] uppercase tracking-[0.3em] text-white/55">Ambiance</p>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((t) => (
              <button key={t.key} onClick={() => pick(t)} title={t.label} aria-label={t.label} className={`relative h-10 w-10 rounded-full border border-white/15 transition-transform hover:scale-110 ${active === t.key && accent === "off" ? "ring-2 ring-white/70 ring-offset-2 ring-offset-[rgba(9,7,20,0.84)]" : ""}`} style={{ background: t.swatch }} />
            ))}
          </div>

          <div className="my-4 h-px bg-white/10" />

          <p className="mb-3 px-1 text-[10px] uppercase tracking-[0.3em] text-white/55">Couleur du fond</p>
          <div className="grid grid-cols-6 gap-2">
            {ACCENTS.map((a) => (
              <button key={a.key} onClick={() => pickAccent(a)} title={a.label} aria-label={a.label} className={`relative h-9 w-9 rounded-full border border-white/15 transition-transform hover:scale-110 ${accent === a.key ? "ring-2 ring-white/70 ring-offset-2 ring-offset-[rgba(9,7,20,0.84)]" : ""}`} style={{ background: a.swatch }}>
                {a.key === "off" && <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white/70">OFF</span>}
              </button>
            ))}
          </div>
          <p className="mt-3 px-1 text-[10px] text-white/48">{accent !== "off" ? `Fond : ${ACCENTS.find((a) => a.key === accent)?.label}` : THEMES.find((t) => t.key === active)?.label}</p>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-label="Personnaliser le thème" data-testid="theme-bubble-toggle" className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[rgba(9,7,20,0.72)] shadow-[0_18px_50px_-18px_rgba(0,0,0,0.6),0_0_30px_rgba(34,211,238,0.18),0_0_34px_rgba(232,121,249,0.14)] backdrop-blur-2xl transition-transform duration-300 hover:scale-105">
        <span className="absolute inset-0 opacity-95" style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02) 38%,rgba(255,255,255,0.08))" }} />
        <span className="absolute inset-[1px] rounded-full" style={{ background: "conic-gradient(from 0deg,rgba(255,79,216,0.26),rgba(124,58,237,0.18),rgba(34,211,238,0.24),rgba(251,191,36,0.16),rgba(255,79,216,0.26))", animation: "lovanet-bg-shift 10s ease infinite" }} />
        <AnimatedThemeGlyph active={open} />
        {open && <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-[rgba(10,6,20,0.9)] text-white shadow-[0_0_12px_rgba(255,255,255,0.12)]"><X className="h-3.5 w-3.5" /></span>}
      </button>
    </div>
  );
};

export default ThemeBubble;
