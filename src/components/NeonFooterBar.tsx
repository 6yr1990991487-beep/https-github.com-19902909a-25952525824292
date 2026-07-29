import { useEffect, useRef } from "react";

/**
 * Animated neon light bar — original implementation.
 * Uses canvas to render a flowing chromatic glow at the bottom of the page.
 */
type NeonFooterBarProps = {
  /** When true, renders inline in the flow instead of a fixed bottom bar. */
  inline?: boolean;
  /** Bar height in px (default 28). */
  height?: number;
  className?: string;
};

export const NeonFooterBar = ({ inline = false, height = 28, className = "" }: NeonFooterBarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    window.addEventListener("resize", onResize);

    const start = performance.now();
    const draw = (t: number) => {
      const elapsed = (t - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      const stops = [
        { c: "#ff2bd6", o: 0 },
        { c: "#2bd6ff", o: 0.33 },
        { c: "#a855f7", o: 0.66 },
        { c: "#ff2bd6", o: 1 },
      ];
      const offset = (elapsed * 0.15) % 1;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      stops.forEach((s) => {
        let o = (s.o + offset) % 1;
        if (o < 0) o += 1;
        grad.addColorStop(Math.min(1, Math.max(0, o)), s.c);
      });

      // Soft glow
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.1 + i * 0.04;
        const y = h / 2 + Math.sin(elapsed * 2 + i) * 4 * devicePixelRatio;
        ctx.fillRect(0, y - (i + 1) * 2 * devicePixelRatio, w, (i + 1) * 4 * devicePixelRatio);
      }

      // Core line
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.fillRect(0, h / 2 - 1 * devicePixelRatio, w, 2 * devicePixelRatio);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const wrapperClass = inline
    ? `relative w-full pointer-events-none ${className}`
    : `fixed bottom-0 left-0 right-0 z-50 pointer-events-none ${className}`;
  return (
    <div className={wrapperClass}>
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px` }}
        aria-hidden
      />
    </div>
  );
};

export default NeonFooterBar;