import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Anime Moments — clickable RGB orb over an animated 3D background.
 * Fully self-contained: rotation, pause, speed, prev/next shape controls.
 */
const SHAPES = [
  { name: "orb", clip: "circle(50% at 50% 50%)" },
  { name: "hex", clip: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)" },
  { name: "star", clip: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" },
  { name: "diamond", clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  { name: "burst", clip: "polygon(50% 0%, 58% 18%, 80% 8%, 72% 30%, 100% 30%, 78% 45%, 95% 65%, 70% 60%, 75% 90%, 55% 70%, 45% 100%, 38% 72%, 18% 92%, 22% 65%, 0% 60%, 22% 45%, 0% 28%, 28% 30%, 22% 8%, 42% 18%)" },
  { name: "shield", clip: "polygon(50% 2%, 95% 18%, 90% 65%, 50% 98%, 10% 65%, 5% 18%)" },
  { name: "gear", clip: "polygon(48% 0%, 52% 0%, 58% 12%, 72% 8%, 75% 22%, 88% 25%, 84% 38%, 96% 48%, 96% 52%, 84% 62%, 88% 75%, 75% 78%, 72% 92%, 58% 88%, 52% 100%, 48% 100%, 42% 88%, 28% 92%, 25% 78%, 12% 75%, 16% 62%, 4% 52%, 4% 48%, 16% 38%, 12% 25%, 25% 22%, 28% 8%, 42% 12%)" },
];

export default function AnimeMomentsOrb() {
  const [shape, setShape] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.25 .. 3
  const [dir, setDir] = useState<1 | -1>(1);
  // Live values kept in refs to avoid re-rendering every frame.
  const hueRef = useRef(0);
  const angleRef = useRef(0);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);
  const dirRef = useRef<1 | -1>(dir);
  const rafRef = useRef<number>();
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const orbRef = useRef<HTMLButtonElement>(null);
  const orbConicRef = useRef<HTMLSpanElement>(null);
  const orbHiliteRef = useRef<HTMLSpanElement>(null);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { dirRef.current = dir; }, [dir]);

  useEffect(() => {
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!pausedRef.current) {
        angleRef.current += dt * 40 * speedRef.current * dirRef.current;
        hueRef.current = (hueRef.current + dt * 30 * speedRef.current + 360) % 360;
      }
      const angle = angleRef.current;
      const hue = hueRef.current;
      if (bgRef.current) {
        bgRef.current.style.background =
          `radial-gradient(60% 50% at 50% 40%, hsl(${hue} 90% 55% / 0.28), transparent 70%),` +
          `radial-gradient(40% 40% at 70% 70%, hsl(${(hue + 120) % 360} 90% 55% / 0.22), transparent 75%),` +
          `radial-gradient(35% 35% at 20% 80%, hsl(${(hue + 240) % 360} 90% 55% / 0.22), transparent 75%)`;
      }
      ringRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = rings[i];
        const h = (hue + r.hueShift) % 360;
        el.style.transform = `rotateX(${r.tilt}deg) rotateZ(${angle * r.spin}deg)`;
        el.style.borderColor = `hsl(${h} 100% 65% / 0.6)`;
        el.style.boxShadow = `0 0 24px hsl(${h} 100% 65% / 0.35), inset 0 0 24px hsl(${h} 100% 65% / 0.25)`;
      });
      particleRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = particles[i];
        const rad = ((p.a + angle * 0.6) * Math.PI) / 180;
        const x = Math.cos(rad) * p.r;
        const y = Math.sin(rad) * p.r * 0.4;
        const color = `hsl(${(hue + p.hueShift) % 360} 100% 65%)`;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.style.background = color;
        el.style.boxShadow = `0 0 10px ${color}`;
      });
      if (orbRef.current) {
        orbRef.current.style.transform = `rotateZ(${angle * 0.4}deg)`;
      }
      if (orbConicRef.current) {
        orbConicRef.current.style.background = `conic-gradient(from ${angle}deg, hsl(${hue} 100% 60%), hsl(${(hue + 60) % 360} 100% 60%), hsl(${(hue + 120) % 360} 100% 60%), hsl(${(hue + 180) % 360} 100% 60%), hsl(${(hue + 240) % 360} 100% 60%), hsl(${(hue + 300) % 360} 100% 60%), hsl(${hue} 100% 60%))`;
        orbConicRef.current.style.boxShadow = `0 0 60px hsl(${hue} 100% 60% / 0.9), 0 0 120px hsl(${(hue + 180) % 360} 100% 60% / 0.5)`;
      }
      if (orbHiliteRef.current) {
        orbHiliteRef.current.style.background =
          `radial-gradient(circle at 35% 30%, hsl(0 0% 100% / 0.85), transparent 45%),` +
          `radial-gradient(circle at 60% 70%, hsl(${(hue + 60) % 360} 100% 70% / 0.5), transparent 60%)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cycle = () => setShape((s) => (s + 1) % SHAPES.length);
  const prev = () => setShape((s) => (s - 1 + SHAPES.length) % SHAPES.length);

  const rings = useMemo(
    () => [0, 1, 2, 3, 4].map((i) => ({
      size: 140 + i * 90,
      tilt: 65 + i * 5,
      spin: (i % 2 === 0 ? 1 : -1) * (0.6 + i * 0.15),
      hueShift: i * 40,
    })),
    []
  );

  const particles = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({
      r: 90 + (i * 17) % 260,
      a: (i * 137.5) % 360,
      s: 3 + (i % 5),
      hueShift: (i * 23) % 360,
    })),
    []
  );

  return (
    <section className="relative w-full py-14 overflow-hidden">
      {/* 3D animated background */}
      <div
        ref={bgRef}
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          filter: "saturate(1.4)",
        }}
      />
      {/* Star-field */}
      <div aria-hidden className="absolute inset-0 -z-10 opacity-70" style={{
        backgroundImage:
          "radial-gradient(1px 1px at 15% 20%, #fff, transparent 60%)," +
          "radial-gradient(1px 1px at 75% 30%, #fff, transparent 60%)," +
          "radial-gradient(1px 1px at 40% 70%, #fff, transparent 60%)," +
          "radial-gradient(1.5px 1.5px at 85% 80%, #fff, transparent 60%)," +
          "radial-gradient(1px 1px at 55% 15%, #fff, transparent 60%)",
      }} />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Anime moments</p>
          <div
            className="flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md ring-1 ring-white/15 px-2 py-1"
          >
            <button
              type="button"
              onClick={prev}
              className="text-white/80 hover:text-white px-2"
              aria-label="Forme précédente"
            >‹</button>
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-24 accent-fuchsia-400"
              aria-label="Vitesse"
            />
            <button
              type="button"
              onClick={cycle}
              className="text-white/80 hover:text-white px-2"
              aria-label="Forme suivante"
            >›</button>
            <button
              type="button"
              onClick={() => setDir((d) => (d === 1 ? -1 : 1))}
              className="text-[10px] uppercase tracking-wider text-white/80 hover:text-white px-2"
              aria-label="Inverser la rotation"
            >{dir === 1 ? "↻" : "↺"}</button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label={paused ? "Lecture" : "Pause"}
            >{paused ? "▶" : "❚❚"}</button>
          </div>
        </div>

        <div
          ref={rootRef}
          className="relative w-full h-[380px] sm:h-[460px] select-none"
          style={{ perspective: "1200px" }}
          onWheel={(e) => {
            const delta = e.deltaY > 0 ? 0.05 : -0.05;
            setSpeed((s) => Math.min(3, Math.max(0.25, s + delta)));
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
            {/* Rotating 3D rings */}
            {rings.map((r, i) => (
              <div
                key={i}
                ref={(el) => (ringRefs.current[i] = el)}
                aria-hidden
                className="absolute rounded-full"
                style={{
                  width: r.size,
                  height: r.size,
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              />
            ))}

            {/* Orbiting particles */}
            {particles.map((p, i) => {
              return (
                <span
                  key={i}
                  ref={(el) => (particleRefs.current[i] = el)}
                  aria-hidden
                  className="absolute rounded-full"
                  style={{
                    width: p.s,
                    height: p.s,
                    willChange: "transform",
                  }}
                />
              );
            })}

            {/* Central clickable RGB orb */}
            <button
              ref={orbRef}
              type="button"
              onClick={cycle}
              aria-label="Changer la forme du halo"
              className="relative group"
              style={{
                width: 220,
                height: 220,
                willChange: "transform",
              }}
            >
              <span
                ref={orbConicRef}
                aria-hidden
                className="absolute inset-0"
                style={{
                  clipPath: SHAPES[shape].clip,
                  filter: "saturate(1.5) blur(0.2px)",
                  transition: "clip-path .5s ease",
                }}
              />
              <span
                ref={orbHiliteRef}
                aria-hidden
                className="absolute inset-3"
                style={{
                  clipPath: SHAPES[shape].clip,
                  mixBlendMode: "screen",
                }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-white font-display font-black uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              >
                Anime
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}