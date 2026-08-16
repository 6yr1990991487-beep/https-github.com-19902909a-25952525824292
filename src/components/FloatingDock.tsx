import { Children, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

const POS_KEY = "lovanet.dock.pos.v1";
const ORDER_KEY = "lovanet.dock.order.v1";
const LONG_PRESS_MS = 300;

type Pos = { x: number; y: number };

/**
 * Panneau transparent horizontal, rétractable, ancré au bord gauche.
 * Il descend / monte doucement en fonction du défilement de la page
 * et regroupe les bulles flottantes (réduites).
 */
export const FloatingDock = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [top, setTop] = useState(0.45);
  const [pos, setPos] = useState<Pos | null>(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      return raw ? (JSON.parse(raw) as Pos) : null;
    } catch {
      return null;
    }
  });
  const rootRef = useRef<HTMLDivElement>(null);

  const slots = Children.toArray(children);
  const [order, setOrder] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(ORDER_KEY);
      const parsed = raw ? (JSON.parse(raw) as number[]) : null;
      if (parsed && parsed.length === slots.length) return parsed;
    } catch {
      /* ignore */
    }
    return slots.map((_, i) => i);
  });
  useEffect(() => {
    setOrder((o) => (o.length === slots.length ? o : slots.map((_, i) => i)));
  }, [slots.length]);
  useEffect(() => {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {
      /* ignore */
    }
  }, [order]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (pos) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        // Course courte et réactive : entre 34% et 62% de la hauteur de fenêtre.
        setTop(0.34 + p * 0.28);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pos]);

  /* ---- Déplacement de toute la barre ---- */
  const moveRef = useRef<{ dx: number; dy: number } | null>(null);
  const onBarPointerDown = useCallback((e: React.PointerEvent) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    moveRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }, []);
  const onBarPointerMove = useCallback((e: React.PointerEvent) => {
    const m = moveRef.current;
    const el = rootRef.current;
    if (!m || !el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(2, e.clientX - m.dx), window.innerWidth - rect.width - 2);
    const y = Math.min(Math.max(2, e.clientY - m.dy), window.innerHeight - rect.height - 2);
    setPos({ x, y });
  }, []);
  const onBarPointerUp = useCallback(() => {
    if (moveRef.current && pos) {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify(pos));
      } catch {
        /* ignore */
      }
    }
    moveRef.current = null;
  }, [pos]);

  /* ---- Réorganisation individuelle des icônes ---- */
  const pressTimer = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const clearPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const onSlotPointerDown = (slotPos: number) => (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    clearPress();
    pressTimer.current = window.setTimeout(() => setDragIndex(slotPos), LONG_PRESS_MS);
  };

  const onSlotPointerMove = (e: React.PointerEvent) => {
    if (dragIndex === null) return;
    e.preventDefault();
    const panel = panelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>("[data-dock-slot]"));
    let target = dragIndex;
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (e.clientY > r.top && e.clientY < r.bottom) target = i;
    });
    if (target !== dragIndex) {
      setOrder((prev) => {
        const next = [...prev];
        const [m] = next.splice(dragIndex, 1);
        next.splice(target, 0, m);
        return next;
      });
      setDragIndex(target);
    }
  };

  const onSlotPointerUp = () => {
    clearPress();
    setDragIndex(null);
  };

  return (
    <div
      ref={rootRef}
      className="floating-dock"
      data-collapsed={collapsed}
      style={
        pos
          ? { top: `${pos.y}px`, left: `${pos.x}px`, transform: "none" }
          : { top: `${top * 100}vh`, transform: "translateY(-50%)" }
      }
      data-testid="floating-dock"
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="floating-dock-handle"
        aria-label={collapsed ? "Afficher les outils" : "Masquer les outils"}
        style={collapsed ? { marginRight: "-0.35rem" } : undefined}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
      <div className="floating-dock-panel" ref={panelRef}>
        <div
          className="floating-dock-move"
          onPointerDown={onBarPointerDown}
          onPointerMove={onBarPointerMove}
          onPointerUp={onBarPointerUp}
          onPointerCancel={onBarPointerUp}
          onDoubleClick={() => {
            setPos(null);
            try {
              localStorage.removeItem(POS_KEY);
            } catch {
              /* ignore */
            }
          }}
          title="Déplacer la barre (double-clic pour réinitialiser)"
          aria-label="Déplacer la barre d'outils"
          role="button"
        >
          <GripVertical className="h-3.5 w-3.5 opacity-70" />
        </div>
        {order.map((childIndex, slotPos) => (
          <div
            key={`dock-slot-${childIndex}`}
            data-dock-slot
            data-dock-dragging={dragIndex === slotPos ? "true" : undefined}
            onPointerDown={onSlotPointerDown(slotPos)}
            onPointerMove={onSlotPointerMove}
            onPointerUp={onSlotPointerUp}
            onPointerCancel={onSlotPointerUp}
            style={dragIndex === slotPos ? { touchAction: "none" } : undefined}
          >
            {slots[childIndex]}
          </div>
        ))}
      </div>
    </div>
  );
};

export const FloatingDockSlot = ({ children }: { children: ReactNode }) => (
  <div className="floating-dock-slot">{children}</div>
);

export default FloatingDock;
