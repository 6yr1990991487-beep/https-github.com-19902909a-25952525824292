import { ReactNode, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Panneau transparent horizontal, rétractable, ancré au bord gauche.
 * Il descend / monte doucement en fonction du défilement de la page
 * et regroupe les bulles flottantes (réduites).
 */
export const FloatingDock = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [top, setTop] = useState(0.45);

  useEffect(() => {
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
  }, []);

  return (
    <div
      className="floating-dock"
      data-collapsed={collapsed}
      style={{ top: `${top * 100}vh`, transform: "translateY(-50%)" }}
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
      <div className="floating-dock-panel">
        {children}
      </div>
    </div>
  );
};

export const FloatingDockSlot = ({ children }: { children: ReactNode }) => (
  <div className="floating-dock-slot">{children}</div>
);

export default FloatingDock;
