import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type Cover = { id: number; img: string; color?: string; title?: string };

/**
 * Small 3D rotating circular carousel that mirrors the catalogue cards.
 * Reads cached AniList data from localStorage (populated by /anime-catalog).
 * Falls back to a quick fetch if no cache.
 */
const QUERY = `query{Page(page:1,perPage:40){media(type:ANIME,sort:TRENDING_DESC,isAdult:false){id title{romaji english} coverImage{large color}}}}`;

export default function MiniCatalogOrb({
  size = 188,
  cardW = 32,
  cardH = 48,
}: { size?: number; cardW?: number; cardH?: number }) {
  const [items, setItems] = useState<Cover[]>([]);
  const raf = useRef<number>();
  const [morph, setMorph] = useState(0);
  const [isConstrained, setIsConstrained] = useState(false);
  const angleRef = useRef(0);
  const hueRef = useRef(0);
  const pulseRef = useRef(0);
  const speedRef = useRef(18);
  const hoveredRef = useRef(false);

  const glowRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(SVGSVGElement | null)[]>([]);
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: coarse), (max-width: 767px), (prefers-reduced-motion: reduce)");
    const update = () => setIsConstrained(media.matches || ((navigator as any).deviceMemory ?? 8) < 4);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  const cycle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMorph((i) => (i + 1) % 4);
    speedRef.current = speedRef.current >= 90 ? 18 : speedRef.current + 24;
  }, []);

  useEffect(() => {
    const hydrate = (raw: any[]): Cover[] =>
      (raw || [])
        .map((m: any) => ({
          id: m.id,
          img: m?.coverImage?.large || m?.coverImage?.extraLarge,
          color: m?.coverImage?.color,
          title: m?.title?.english || m?.title?.romaji,
        }))
        .filter((c) => !!c.img)
        .slice(0, 28);
    try {
      const g = localStorage.getItem("lovanet.cache.catalog.grid");
      const t = localStorage.getItem("lovanet.cache.catalog.top");
      const arr = g ? JSON.parse(g) : t ? JSON.parse(t) : null;
      if (arr?.length) setItems(hydrate(arr));
    } catch {}
    fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY }),
    })
      .then((r) => r.json())
      .then((j) => {
        const list = j?.data?.Page?.media ?? [];
        if (list.length) setItems(hydrate(list));
      })
      .catch(() => {});
  }, []);

  // Space out cards: cap visible count so they don't overlap
  const visible = items.slice(0, isConstrained ? 8 : 12);
  const N = Math.max(visible.length, 1);
  const radius = Math.max(70, size * 0.46);

  useEffect(() => {
    let last = performance.now();
    let lastPaint = last;
    const tick = (t: number) => {
      const minFrameMs = isConstrained ? 34 : 17;
      if (t - lastPaint < minFrameMs) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      lastPaint = t;
      const sp = hoveredRef.current ? speedRef.current * 2.2 : speedRef.current;
      angleRef.current = (angleRef.current + dt * sp) % 360;
      hueRef.current = (hueRef.current + dt * 60) % 360;
      pulseRef.current = (pulseRef.current + dt * 60) % 360;
      const angle = angleRef.current;
      const hue = hueRef.current;
      const pulse = pulseRef.current;
      const pulseScale = 1 + Math.sin((pulse * Math.PI) / 180) * 0.04;
      const wobble = Math.sin((pulse * Math.PI) / 90) * 6;

      // Constrain palette to blue→cyan→green (140°–240°) — no pink/magenta bleed
      const safeHue = 140 + ((Math.sin((hue * Math.PI) / 180) + 1) / 2) * 100;
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(circle at 50% 50%, hsl(${safeHue} 70% 60% / ${isConstrained ? 0.14 : 0.22}), hsl(${(safeHue + 40) % 360} 70% 55% / ${isConstrained ? 0.08 : 0.14}) 40%, transparent 70%)`;
        glowRef.current.style.transform = `scale(${isConstrained ? 1 : pulseScale})`;
      }
      const ringMeta = [
        { tiltX: 70, tiltY: 0, spin: 1 },
        { tiltX: 20, tiltY: 60, spin: -1.4 },
        { tiltX: 55, tiltY: -40, spin: 0.8 },
      ];
      ringRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = ringMeta[i];
        el.style.transform = `rotateX(${r.tiltX + morph * 8}deg) rotateY(${r.tiltY + morph * 12}deg) rotateZ(${angle * r.spin}deg)`;
        const rh = 160 + i * 40;
        el.style.filter = isConstrained ? "none" : `drop-shadow(0 0 4px hsl(${rh} 70% 60% / 0.55))`;
      });
      particleRefs.current.forEach((el, i) => {
        if (!el) return;
        const th = (angle * 2 + i * 36) % 360;
        const r = radius + 14;
        const x = Math.cos((th * Math.PI) / 180) * r;
        const y = Math.sin(((th * Math.PI) / 180) * 1.6) * (r * 0.4);
        const ph = 160 + ((i * 37) % 90);
        const c = `hsl(${ph} 70% 70%)`;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.background = c;
        el.style.boxShadow = `0 0 10px ${c}`;
      });
      if (stageRef.current) {
        stageRef.current.style.transform = `rotateX(${-14 + (isConstrained ? 0 : wobble)}deg) rotateY(${angle}deg) rotateZ(${isConstrained ? 0 : wobble * 0.4}deg) scale(${isConstrained ? 1 : pulseScale})`;
      }
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const theta = (360 / N) * i;
        const lift = isConstrained ? 0 : Math.sin(((angle + i * 30) * Math.PI) / 180) * 6;
        el.style.transform = `rotateY(${theta}deg) translateY(${lift}px) translateZ(${radius}px) rotateY(${-theta - angle}deg)`;
        el.style.opacity = "1";
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [morph, N, radius, isConstrained]);

  return (
    <Link
      to="/anime-catalog"
      aria-label="Explorer le catalogue animé"
      className="relative block select-none group"
      style={{ width: size, height: size, perspective: 900 }}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      onClick={cycle}
    >
      {/* Diffuse plasma glow behind everything */}
      <span
        ref={glowRef}
        aria-hidden
        className="absolute -inset-6 rounded-full pointer-events-none"
        style={{
          filter: "blur(24px)",
          willChange: "transform",
        }}
      />
      {/* Orbital neon rings — tilted at different angles for a gyroscope feel */}
      {[
        { tiltX: 70, tiltY: 0, spin: 1, dash: "6 10" },
        { tiltX: 20, tiltY: 60, spin: -1.4, dash: "4 14" },
        { tiltX: 55, tiltY: -40, spin: 0.8, dash: "10 6" },
      ].map((r, i) => (
        <svg
          key={i}
          ref={(el) => (ringRefs.current[i] = el)}
          aria-hidden
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <defs>
            <linearGradient id={`ring-g-${i}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={`hsl(${160 + i * 30} 70% 65%)`} />
              <stop offset="50%" stopColor={`hsl(${190 + i * 20} 70% 60%)`} />
              <stop offset="100%" stopColor={`hsl(${210 + i * 15} 70% 60%)`} />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={Math.max(2, 44 - i * 3)}
            fill="none"
            stroke={`url(#ring-g-${i})`}
            strokeWidth={1.4}
            strokeDasharray={r.dash}
            strokeLinecap="round"
            opacity={0.9}
          />
        </svg>
      ))}
      {/* Floating particles orbiting the sphere */}
      {Array.from({ length: 10 }).map((_, i) => {
        return (
          <span
            key={i}
            ref={(el) => (particleRefs.current[i] = el)}
            aria-hidden
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
            style={{
              width: 4,
              height: 4,
              willChange: "transform",
            }}
          />
        );
      })}
      <div
        ref={stageRef}
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {visible.map((m, i) => {
          return (
            <div
              key={m.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className="absolute top-1/2 left-1/2 rounded-md overflow-hidden ring-1 ring-white/20"
              style={{
                width: cardW,
                height: cardH,
                marginLeft: -cardW / 2,
                marginTop: -cardH / 2,
                background: m.color || "#222",
                boxShadow: `0 0 8px ${m.color || "#a855f7"}aa`,
                backfaceVisibility: "visible",
                willChange: "transform, opacity",
              }}
            >
              <img
                src={m.img}
                alt={m.title || ""}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>
      <span className="absolute -bottom-5 left-0 right-0 text-center text-[10px] uppercase tracking-[0.3em] text-white/70">
        Catalogue
      </span>
    </Link>
  );
}