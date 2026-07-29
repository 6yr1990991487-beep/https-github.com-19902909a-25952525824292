import { ReactNode, useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Interactive pseudo-3D viewer: drag horizontally (mouse / touch) to spin the
 * product artwork on its Y axis.
 */
export const Product360Viewer = ({ children, className }: Props) => {
  const [angle, setAngle] = useState(-12);
  const [autoSpin, setAutoSpin] = useState(true);
  const dragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    if (!autoSpin) return;
    let raf = 0;
    const tick = () => {
      setAngle((a) => a + 0.35);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoSpin]);

  const onDown = (clientX: number) => {
    dragging.current = true;
    lastX.current = clientX;
    setAutoSpin(false);
  };
  const onMove = (clientX: number) => {
    if (!dragging.current) return;
    const dx = clientX - lastX.current;
    lastX.current = clientX;
    setAngle((a) => a + dx * 0.6);
  };
  const onUp = () => {
    dragging.current = false;
  };

  return (
    <div
      className={`relative select-none overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background ${className ?? ""}`}
      style={{ perspective: "1200px" }}
      onMouseDown={(e) => onDown(e.clientX)}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => onDown(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onUp}
    >
      <div
        className="aspect-square w-full flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `rotateY(${angle}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="w-full h-full overflow-hidden rounded-2xl drop-shadow-[0_20px_40px_hsl(var(--primary)/0.35)]"
          style={{
            filter: `brightness(${0.85 + 0.25 * Math.cos((angle * Math.PI) / 180)})`,
          }}
        >
          {children}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <RotateCw className="w-3.5 h-3.5 text-primary animate-pulse" />
        <span>Glissez pour faire tourner · 360°</span>
      </div>

      <button
        type="button"
        onClick={() => setAutoSpin((s) => !s)}
        className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition"
        aria-label={autoSpin ? "Stop rotation" : "Start rotation"}
      >
        {autoSpin ? "Pause" : "Auto"}
      </button>
    </div>
  );
};

export default Product360Viewer;