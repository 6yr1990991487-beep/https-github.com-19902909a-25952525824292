import { useEffect, useMemo, useRef, useState } from "react";

/**
 * MangaNeonBar — a distinct neon RGB bar with 50 curated manga-inspired
 * theme variations (colors, patterns, motion). Cycles smoothly between
 * themes and renders an animated backdrop via canvas.
 *
 * Design goals:
 *  - Épuré & moderne (no clutter, thin bar, subtle glow)
 *  - Ambiance manga/anime (sakura, shonen, cyber-tokyo, ghibli, mecha…)
 *  - 50 variations, chacune avec sa palette + son motif d'arrière-plan
 */

type Theme = {
  name: string;
  colors: [string, string, string, string];
  /** Motion / pattern kind driving the backdrop animation. */
  pattern:
    | "flow"      // fluid horizontal gradient stream
    | "pulse"     // radial pulses
    | "waves"     // sinusoidal waves
    | "sparks"    // moving particles
    | "scanline"  // cyber scanning line
    | "petals"    // drifting petals (sakura)
    | "stripes"   // shonen speed stripes
    | "grid";     // vaporwave grid
};

/** 50 manga-themed variations. */
const THEMES: Theme[] = [
  { name: "Sakura Bloom",     colors: ["#ffb7d5", "#ff69b4", "#ffffff", "#ffb7d5"], pattern: "petals" },
  { name: "Shonen Fire",      colors: ["#ff5722", "#ffb300", "#ff1744", "#ff5722"], pattern: "stripes" },
  { name: "Neo-Tokyo",        colors: ["#ff00c8", "#00e5ff", "#7c4dff", "#ff00c8"], pattern: "scanline" },
  { name: "Ghibli Sky",       colors: ["#a0d8f1", "#ffffff", "#d3eaf6", "#a0d8f1"], pattern: "flow" },
  { name: "Demon Slayer",     colors: ["#0f172a", "#22c55e", "#f43f5e", "#0f172a"], pattern: "waves" },
  { name: "Sailor Moonlight", colors: ["#f5c6ff", "#7dd3fc", "#facc15", "#f5c6ff"], pattern: "sparks" },
  { name: "Cyber Akira",      colors: ["#ff073a", "#ffea00", "#ffffff", "#ff073a"], pattern: "scanline" },
  { name: "One Piece Sea",    colors: ["#0284c7", "#38bdf8", "#facc15", "#0284c7"], pattern: "waves" },
  { name: "Bleach Reiatsu",   colors: ["#f8fafc", "#60a5fa", "#0ea5e9", "#f8fafc"], pattern: "pulse" },
  { name: "Naruto Chakra",    colors: ["#f97316", "#eab308", "#3b82f6", "#f97316"], pattern: "sparks" },
  { name: "AOT Titan",        colors: ["#6b4423", "#c2410c", "#111827", "#6b4423"], pattern: "stripes" },
  { name: "JoJo Golden",      colors: ["#ffd700", "#ff00ff", "#00ffff", "#ffd700"], pattern: "flow" },
  { name: "Chainsaw Devil",   colors: ["#dc2626", "#f97316", "#111111", "#dc2626"], pattern: "sparks" },
  { name: "Spirited Bath",    colors: ["#fde68a", "#f472b6", "#94a3b8", "#fde68a"], pattern: "flow" },
  { name: "Mecha Steel",      colors: ["#94a3b8", "#0ea5e9", "#f43f5e", "#94a3b8"], pattern: "grid" },
  { name: "Yokai Night",      colors: ["#4c1d95", "#a855f7", "#22d3ee", "#4c1d95"], pattern: "sparks" },
  { name: "Vaporwave Otaku",  colors: ["#ff71ce", "#01cdfe", "#05ffa1", "#ff71ce"], pattern: "grid" },
  { name: "Studio Trigger",   colors: ["#facc15", "#ef4444", "#0ea5e9", "#facc15"], pattern: "stripes" },
  { name: "Cowboy Bebop",     colors: ["#eab308", "#7c3aed", "#f97316", "#eab308"], pattern: "flow" },
  { name: "Evangelion Unit",  colors: ["#7c3aed", "#22c55e", "#f97316", "#7c3aed"], pattern: "pulse" },
  { name: "Dragon Aura",      colors: ["#facc15", "#f97316", "#22d3ee", "#facc15"], pattern: "pulse" },
  { name: "Fullmetal Alch",   colors: ["#b91c1c", "#fbbf24", "#111111", "#b91c1c"], pattern: "waves" },
  { name: "Death Note",       colors: ["#0a0a0a", "#dc2626", "#f5f5f5", "#0a0a0a"], pattern: "scanline" },
  { name: "Hunter x Hunter",  colors: ["#166534", "#facc15", "#0f172a", "#166534"], pattern: "sparks" },
  { name: "Tokyo Ghoul",      colors: ["#111111", "#ef4444", "#f8fafc", "#111111"], pattern: "scanline" },
  { name: "MHA Plus Ultra",   colors: ["#16a34a", "#dc2626", "#facc15", "#16a34a"], pattern: "stripes" },
  { name: "Fate Servant",     colors: ["#1e3a8a", "#f5c518", "#e11d48", "#1e3a8a"], pattern: "pulse" },
  { name: "Kaguya Rose",      colors: ["#fbcfe8", "#f472b6", "#a78bfa", "#fbcfe8"], pattern: "petals" },
  { name: "Rurouni Sunset",   colors: ["#f97316", "#7f1d1d", "#fde68a", "#f97316"], pattern: "flow" },
  { name: "Berserk Eclipse",  colors: ["#7f1d1d", "#000000", "#dc2626", "#7f1d1d"], pattern: "waves" },
  { name: "Sword Art Aincrad",colors: ["#0ea5e9", "#a855f7", "#f472b6", "#0ea5e9"], pattern: "grid" },
  { name: "Made in Abyss",    colors: ["#134e4a", "#f59e0b", "#f5f5f4", "#134e4a"], pattern: "waves" },
  { name: "Mob 100%",         colors: ["#a78bfa", "#22d3ee", "#f472b6", "#a78bfa"], pattern: "pulse" },
  { name: "Konosuba Party",   colors: ["#f472b6", "#38bdf8", "#facc15", "#f472b6"], pattern: "sparks" },
  { name: "Steins Divergence",colors: ["#7c3aed", "#f43f5e", "#f5f5f4", "#7c3aed"], pattern: "scanline" },
  { name: "Hokusai Wave",     colors: ["#1e40af", "#f8fafc", "#0ea5e9", "#1e40af"], pattern: "waves" },
  { name: "Sakura Petal",     colors: ["#ffe4ec", "#f9a8d4", "#fda4af", "#ffe4ec"], pattern: "petals" },
  { name: "Kirby Dream",      colors: ["#f9a8d4", "#fecaca", "#bae6fd", "#f9a8d4"], pattern: "sparks" },
  { name: "Pokemon Volt",     colors: ["#facc15", "#dc2626", "#0ea5e9", "#facc15"], pattern: "stripes" },
  { name: "Gundam Wing",      colors: ["#60a5fa", "#f43f5e", "#f8fafc", "#60a5fa"], pattern: "grid" },
  { name: "Shinkai Rain",     colors: ["#312e81", "#38bdf8", "#f5c6ff", "#312e81"], pattern: "waves" },
  { name: "Nichijou Pastel",  colors: ["#fecdd3", "#bfdbfe", "#fef08a", "#fecdd3"], pattern: "flow" },
  { name: "Trigun Desert",    colors: ["#f59e0b", "#dc2626", "#78350f", "#f59e0b"], pattern: "stripes" },
  { name: "Nier Automata",    colors: ["#e7e5e4", "#a8a29e", "#f59e0b", "#e7e5e4"], pattern: "scanline" },
  { name: "Persona Velvet",   colors: ["#1e3a8a", "#f59e0b", "#f5f5f4", "#1e3a8a"], pattern: "grid" },
  { name: "Bakemono Night",   colors: ["#0f0f23", "#e11d48", "#facc15", "#0f0f23"], pattern: "sparks" },
  { name: "Frieren Journey",  colors: ["#e0f2fe", "#a7f3d0", "#c7d2fe", "#e0f2fe"], pattern: "flow" },
  { name: "Chihayafuru",      colors: ["#fb7185", "#818cf8", "#f5f5f4", "#fb7185"], pattern: "petals" },
  { name: "Jujutsu Kaisen",   colors: ["#1e293b", "#a855f7", "#3b82f6", "#1e293b"], pattern: "pulse" },
  { name: "Kimetsu Water",    colors: ["#0369a1", "#22d3ee", "#f5f5f4", "#0369a1"], pattern: "waves" },
];

type MangaNeonBarProps = {
  height?: number;
  className?: string;
  /** Ms between theme rotations. Default: 6000. */
  intervalMs?: number;
};

export const MangaNeonBar = ({
  height = 26,
  className = "",
  intervalMs = 6000,
}: MangaNeonBarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeIdxRef = useRef(0);
  const themeStartRef = useRef(performance.now());
  const [themeIdx, setThemeIdx] = useState(0);

  // Rotate through themes
  useEffect(() => {
    const id = setInterval(() => {
      setThemeIdx((i) => {
        const next = (i + 1) % THEMES.length;
        themeIdxRef.current = next;
        themeStartRef.current = performance.now();
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  useEffect(() => {
    themeIdxRef.current = themeIdx;
  }, [themeIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = (canvas.width = canvas.offsetWidth * dpr);
    let h = (canvas.height = canvas.offsetHeight * dpr);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
    };
    window.addEventListener("resize", onResize);

    // Persistent particle field for "sparks" / "petals"
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      v: 0.05 + Math.random() * 0.25,
      r: 0.4 + Math.random() * 1.4,
      p: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    const start = performance.now();
    const draw = (t: number) => {
      const elapsed = (t - start) / 1000;
      const theme = THEMES[themeIdxRef.current];
      // Fade-in on theme change
      const sinceTheme = (t - themeStartRef.current) / 1000;
      const fade = Math.min(1, sinceTheme / 0.8);

      ctx.clearRect(0, 0, w, h);

      // Base flowing gradient (all themes share this warm base line)
      const offset = (elapsed * 0.12) % 1;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      theme.colors.forEach((c, i) => {
        let o = ((i / (theme.colors.length - 1)) + offset) % 1;
        if (o < 0) o += 1;
        grad.addColorStop(Math.min(1, Math.max(0, o)), c);
      });

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.22 * fade;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";

      // Pattern-specific backdrop layer
      switch (theme.pattern) {
        case "flow": {
          for (let i = 0; i < 5; i++) {
            ctx.globalAlpha = (0.08 + i * 0.05) * fade;
            const y = h / 2 + Math.sin(elapsed * 1.4 + i * 0.9) * 3 * dpr;
            ctx.fillStyle = grad;
            ctx.fillRect(0, y - (i + 1) * 1.5 * dpr, w, (i + 1) * 3 * dpr);
          }
          break;
        }
        case "pulse": {
          for (let i = 0; i < 6; i++) {
            const cx = ((elapsed * 60 + i * (w / 6)) % (w + 200 * dpr)) - 100 * dpr;
            const r = (10 + (Math.sin(elapsed * 2 + i) * 0.5 + 0.5) * 30) * dpr;
            const rg = ctx.createRadialGradient(cx, h / 2, 0, cx, h / 2, r);
            rg.addColorStop(0, theme.colors[i % 3]);
            rg.addColorStop(1, "transparent");
            ctx.globalAlpha = 0.55 * fade;
            ctx.fillStyle = rg;
            ctx.fillRect(cx - r, 0, r * 2, h);
          }
          break;
        }
        case "waves": {
          ctx.lineWidth = 1.5 * dpr;
          for (let i = 0; i < 4; i++) {
            ctx.strokeStyle = theme.colors[i % theme.colors.length];
            ctx.globalAlpha = 0.5 * fade;
            ctx.beginPath();
            for (let x = 0; x <= w; x += 4 * dpr) {
              const y =
                h / 2 +
                Math.sin(x / (26 * dpr) + elapsed * 1.6 + i) * 4 * dpr +
                Math.cos(x / (60 * dpr) - elapsed) * 2 * dpr;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          break;
        }
        case "sparks": {
          particles.forEach((p, i) => {
            const px = ((p.x + elapsed * p.v * 0.15) % 1) * w;
            const py = (0.5 + Math.sin(elapsed * 1.4 + p.p) * 0.35) * h;
            const c = theme.colors[i % theme.colors.length];
            ctx.globalAlpha = 0.85 * fade;
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(px, py, p.r * dpr, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }
        case "scanline": {
          // solid faint base
          ctx.globalAlpha = 0.35 * fade;
          ctx.fillStyle = theme.colors[0];
          ctx.fillRect(0, h / 2 - 0.5 * dpr, w, 1 * dpr);
          // scanning bright column
          const sx = ((elapsed * 0.6) % 1) * w;
          const sw = 80 * dpr;
          const sg = ctx.createLinearGradient(sx - sw, 0, sx + sw, 0);
          sg.addColorStop(0, "transparent");
          sg.addColorStop(0.5, theme.colors[1]);
          sg.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.9 * fade;
          ctx.fillStyle = sg;
          ctx.fillRect(sx - sw, 0, sw * 2, h);
          break;
        }
        case "petals": {
          particles.forEach((p, i) => {
            const px = ((p.x + elapsed * p.v * 0.1) % 1) * w;
            const py =
              (0.5 + Math.sin(elapsed * 0.8 + p.p) * 0.4) * h +
              Math.cos(elapsed + i) * 2 * dpr;
            ctx.globalAlpha = 0.85 * fade;
            ctx.fillStyle = theme.colors[i % theme.colors.length];
            ctx.beginPath();
            ctx.ellipse(px, py, p.r * 1.6 * dpr, p.r * 0.9 * dpr, elapsed + p.p, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }
        case "stripes": {
          const stripeW = 22 * dpr;
          const shift = (elapsed * 40 * dpr) % (stripeW * 2);
          for (let x = -stripeW * 2; x < w + stripeW * 2; x += stripeW * 2) {
            ctx.globalAlpha = 0.5 * fade;
            ctx.fillStyle = theme.colors[0];
            ctx.beginPath();
            ctx.moveTo(x + shift, 0);
            ctx.lineTo(x + shift + stripeW, 0);
            ctx.lineTo(x + shift + stripeW - h * 0.6, h);
            ctx.lineTo(x + shift - h * 0.6, h);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case "grid": {
          const step = 14 * dpr;
          const shift = (elapsed * 20 * dpr) % step;
          ctx.strokeStyle = theme.colors[1];
          ctx.globalAlpha = 0.35 * fade;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = -step + shift; x < w; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x + h * 0.4, h);
          }
          for (let y = 0; y <= h; y += step / 2) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
          }
          ctx.stroke();
          break;
        }
      }

      // Bright core line on top (crisp neon)
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade;
      ctx.fillStyle = grad;
      ctx.fillRect(0, h / 2 - 0.6 * dpr, w, 1.2 * dpr);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const theme = THEMES[themeIdx];
  const glow = useMemo(
    () =>
      `0 0 12px ${theme.colors[0]}55, 0 0 26px ${theme.colors[1]}33, 0 0 60px ${theme.colors[2]}22`,
    [theme]
  );

  return (
    <div
      className={`relative w-full pointer-events-none ${className}`}
      style={{ boxShadow: glow, borderRadius: 9999 }}
      aria-label={`Bande néon manga — ${theme.name}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px`, borderRadius: 9999 }}
        aria-hidden
      />
      {/* Discreet theme label — épuré */}
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.2em] uppercase font-medium"
        style={{ color: theme.colors[1], textShadow: `0 0 8px ${theme.colors[1]}` }}
      >
        {theme.name}
      </span>
    </div>
  );
};

export default MangaNeonBar;