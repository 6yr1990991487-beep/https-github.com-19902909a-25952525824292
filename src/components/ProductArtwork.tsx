import { useMemo } from "react";

/**
 * Deterministic procedural SVG artwork.
 * Each product gets a unique composition derived from its id —
 * no two products share the same visual.
 */

const PALETTES: [string, string, string][] = [
  ["#ff2e93", "#7b2dff", "#00e0ff"],
  ["#ff5e3a", "#ffb13a", "#ffec5e"],
  ["#00ffa3", "#00b8ff", "#7b2dff"],
  ["#ff006e", "#fb5607", "#ffbe0b"],
  ["#8338ec", "#3a86ff", "#06ffa5"],
  ["#ef476f", "#ffd166", "#06d6a0"],
  ["#e63946", "#f1faee", "#a8dadc"],
  ["#ff7ad9", "#a78bfa", "#22d3ee"],
  ["#f43f5e", "#fb923c", "#facc15"],
  ["#10b981", "#06b6d4", "#6366f1"],
  ["#ec4899", "#8b5cf6", "#0ea5e9"],
  ["#facc15", "#ec4899", "#1e293b"],
];

function hash(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Props = {
  seed: string;
  category: string;
  label?: string;
  className?: string;
};

const GLYPHS: Record<string, string[]> = {
  poster: ["夢", "光", "刃", "炎", "雷", "華", "舞", "閃", "瞳", "翼"],
  collector: ["神", "皇", "竜", "魔", "聖", "幻", "極", "覇", "零", "暁"],
  apparel: ["NLNQ", "AMV", "ANM", "TKR", "ICON", "RAW", "DRP", "888", "404", "CTL"],
  sneakers: ["RUN", "AIR", "GLW", "STP", "VRT", "FLX", "JMP", "ZRO", "MTN", "X9"],
  music: ["♪", "♫", "♬", "𝄞", "◉", "△", "◇", "✦", "⌬", "✺"],
  manga: ["話", "巻", "章", "繪", "墨", "筆", "心", "夢", "影", "鏡"],
  daily: ["☕", "✿", "✺", "◐", "✧", "❀", "▲", "✶", "❖", "◈"],
};

export const ProductArtwork = ({ seed, category, label, className }: Props) => {
  const art = useMemo(() => {
    const h = hash(seed);
    const palette = PALETTES[h % PALETTES.length];
    const glyphSet = GLYPHS[category] ?? GLYPHS.poster;
    const glyph = glyphSet[(h >>> 4) % glyphSet.length];
    const rotate = ((h >>> 8) % 60) - 30;
    const shapeKind = (h >>> 12) % 6;
    const dotCount = 8 + ((h >>> 16) % 14);
    const ringR = 30 + ((h >>> 20) % 60);
    const stripeAngle = (h >>> 6) % 180;
    return { palette, glyph, rotate, shapeKind, dotCount, ringR, stripeAngle, h };
  }, [seed, category]);

  const [c1, c2, c3] = art.palette;
  const gid = `g-${art.h.toString(36)}`;
  const sid = `s-${art.h.toString(36)}`;

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className={className ?? "w-full h-full block"}
      role="img"
      aria-label={label ?? seed}
      data-product-seed={seed}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="55%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
        <radialGradient id={sid} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="400" fill={`url(#${gid})`} />

      {/* Concentric rings */}
      <g
        style={{ mixBlendMode: "overlay" }}
        transform={`rotate(${art.stripeAngle} 200 200)`}
        opacity="0.55"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <circle
            key={i}
            cx="200"
            cy="200"
            r={art.ringR + i * 22}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.18 - i * 0.025}
            strokeWidth={2 + (i % 2)}
          />
        ))}
      </g>

      {/* Confetti dots */}
      <g opacity="0.85">
        {Array.from({ length: art.dotCount }).map((_, i) => {
          const a = (i * 137.5 * Math.PI) / 180;
          const r = 80 + ((art.h + i * 31) % 110);
          const x = 200 + Math.cos(a) * r;
          const y = 200 + Math.sin(a) * r;
          const sz = 4 + ((art.h + i * 7) % 10);
          return <circle key={i} cx={x} cy={y} r={Math.max(1, sz)} fill="#fff" opacity={0.35 + ((i * 17) % 30) / 100} />;
        })}
      </g>

      {/* Center motif by category */}
      {category === "sneakers" && (
        <g transform={`translate(200 220) rotate(${art.rotate})`}>
          <path
            d="M-110 30 Q-90 -30 -30 -30 L40 -45 Q70 -50 90 -20 L110 10 Q120 30 100 45 L-100 45 Q-115 45 -110 30 Z"
            fill="#0c0c14"
            stroke="#fff"
            strokeWidth="2"
          />
          <circle cx="-60" cy="20" r="6" fill={c1} />
          <circle cx="20" cy="15" r="6" fill={c3} />
        </g>
      )}
      {category === "apparel" && (
        <g transform={`translate(200 210) rotate(${art.rotate / 3})`}>
          <path
            d="M-90 -60 L-40 -90 L-20 -70 L20 -70 L40 -90 L90 -60 L110 0 L70 20 L70 110 L-70 110 L-70 20 L-110 0 Z"
            fill="#0c0c14"
            stroke="#fff"
            strokeWidth="2"
          />
          <text x="0" y="40" textAnchor="middle" fontFamily="Orbitron, sans-serif" fontWeight="900" fontSize="34" fill={c1}>
            {art.glyph}
          </text>
        </g>
      )}
      {category === "collector" && (
        <g transform={`translate(200 210)`}>
          <polygon points="0,-110 95,-55 95,55 0,110 -95,55 -95,-55" fill="#0c0c14" stroke="#fff" strokeWidth="2" />
          <text x="0" y="20" textAnchor="middle" fontFamily="serif" fontWeight="700" fontSize="100" fill={c2}>
            {art.glyph}
          </text>
        </g>
      )}
      {category === "poster" && (
        <g transform={`translate(200 210)`}>
          <rect x="-110" y="-130" width="220" height="260" rx="8" fill="#0c0c14" stroke="#fff" strokeWidth="2" />
          <text x="0" y="40" textAnchor="middle" fontFamily="serif" fontWeight="900" fontSize="170" fill={c1} opacity="0.9">
            {art.glyph}
          </text>
          <text x="0" y="105" textAnchor="middle" fontFamily="Orbitron, sans-serif" fontSize="11" letterSpacing="4" fill="#fff">
            ANIME MOMENTS
          </text>
        </g>
      )}
      {category === "music" && (
        <g transform={`translate(200 210)`}>
          <circle cx="0" cy="0" r="120" fill="#0c0c14" />
          {[110, 90, 70, 50].map((r) => (
            <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#fff" strokeOpacity="0.15" />
          ))}
          <circle cx="0" cy="0" r="35" fill={c2} />
          <circle cx="0" cy="0" r="6" fill="#0c0c14" />
          <text x="0" y="-150" textAnchor="middle" fontFamily="serif" fontSize="48" fill={c3}>
            {art.glyph}
          </text>
        </g>
      )}
      {category === "manga" && (
        <g transform={`translate(200 210)`}>
          <rect x="-105" y="-130" width="210" height="260" rx="4" fill="#f5f0e6" stroke="#0c0c14" strokeWidth="3" />
          <line x1="-105" y1="-30" x2="105" y2="-30" stroke="#0c0c14" strokeWidth="2" />
          <line x1="0" y1="-30" x2="0" y2="130" stroke="#0c0c14" strokeWidth="2" />
          <text x="0" y="-70" textAnchor="middle" fontFamily="serif" fontWeight="900" fontSize="80" fill="#0c0c14">
            {art.glyph}
          </text>
          <text x="-52" y="80" textAnchor="middle" fontFamily="serif" fontSize="36" fill={c1}>
            ◉
          </text>
          <text x="52" y="80" textAnchor="middle" fontFamily="serif" fontSize="36" fill={c2}>
            ✦
          </text>
        </g>
      )}
      {category === "daily" && (
        <g transform={`translate(200 210)`}>
          <circle cx="0" cy="0" r="110" fill="#0c0c14" />
          <text x="0" y="35" textAnchor="middle" fontSize="120">
            {art.glyph}
          </text>
        </g>
      )}

      {/* Sheen */}
      <rect width="400" height="400" fill={`url(#${sid})`} />

      {/* Brand stamp */}
      <text
        x="20"
        y="385"
        fontFamily="Orbitron, sans-serif"
        fontSize="10"
        letterSpacing="3"
        fill="#ffffff"
        opacity="0.7"
      >
        AnimemomentsAnimeofficiel · {seed.toUpperCase()}
      </text>
    </svg>
  );
};

export default ProductArtwork;