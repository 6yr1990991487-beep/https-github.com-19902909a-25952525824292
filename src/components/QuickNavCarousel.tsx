import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Move, X } from "lucide-react";

export const OPEN_QUICKNAV_EVENT = "lovanet:open-quicknav";
const OPEN_KEY = "lovanet.quicknav.open";

type QuickNavItem = {
  id: string;
  title: string;
  to: string;
  color?: string;
};

const DEFAULT_ITEMS: QuickNavItem[] = [
  { id: "home", title: "Portail", to: "/anime-moments", color: "linear-gradient(45deg, #22d3ee, #6366f1)" },
  { id: "catalog", title: "Catalogue", to: "/anime-catalog", color: "linear-gradient(45deg, #fbbf24, #ef4444)" },
  { id: "ai", title: "AI", to: "/ai-hub", color: "linear-gradient(45deg, #00ff9d, #22d3ee)" },
  { id: "youtube", title: "YouTube", to: "/chaine-youtube", color: "linear-gradient(45deg, #4ade80, #059669)" },
  { id: "shop", title: "Magasin", to: "/shop", color: "linear-gradient(45deg, #f472b6, #9333ea)" },
  { id: "tiktok", title: "TikTok", to: "/tiktok", color: "linear-gradient(45deg, #38bdf8, #2563eb)" },
  { id: "prime", title: "Prime Vidéo", to: "/prime-video", color: "linear-gradient(45deg, #60a5fa, #1d4ed8)" },
  { id: "news", title: "Actualités", to: "/actualites", color: "linear-gradient(45deg, #a78bfa, #6d28d9)" },
  { id: "leader", title: "Classement", to: "/leaderboard", color: "linear-gradient(45deg, #e879f9, #e11d48)" },
];

export default function QuickNavCarousel({ items = DEFAULT_ITEMS, onClose }: { items?: QuickNavItem[]; onClose?: () => void }) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(OPEN_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener(OPEN_QUICKNAV_EVENT, openIt as EventListener);
    return () => window.removeEventListener(OPEN_QUICKNAV_EVENT, openIt as EventListener);
  }, []);

  // Reste ouvert d'une page à l'autre (mobile, application et PC).
  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open]);

  // Défilement par glisser (souris, toucher, appui long) — sans rail de glissement.
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !open) return;
    let active = false;
    let startX = 0;
    let base = 0;

    const down = (e: PointerEvent) => {
      active = true;
      startX = e.clientX;
      base = carousel.scrollLeft;
      carousel.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) carousel.classList.add("is-swiping");
      carousel.scrollLeft = base - dx;
    };
    const up = (e: PointerEvent) => {
      active = false;
      carousel.releasePointerCapture?.(e.pointerId);
      window.setTimeout(() => carousel.classList.remove("is-swiping"), 40);
    };

    carousel.addEventListener("pointerdown", down);
    carousel.addEventListener("pointermove", move);
    carousel.addEventListener("pointerup", up);
    carousel.addEventListener("pointercancel", up);
    return () => {
      carousel.removeEventListener("pointerdown", down);
      carousel.removeEventListener("pointermove", move);
      carousel.removeEventListener("pointerup", up);
      carousel.removeEventListener("pointercancel", up);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="dock-popup quicknav-floating glass3d-panel glass3d-surface"
      data-panel-key="quick-nav"
      role="dialog"
      aria-label="Navigation rapide"
    >
      <div
        data-panel-drag-handle
        className="glass3d-header flex min-h-11 cursor-grab items-center justify-between gap-2 px-3 py-2 active:cursor-grabbing"
      >
        <Move className="h-3.5 w-3.5 text-white/70" />
        <button
          type="button"
          onClick={close}
          aria-label="Fermer la navigation rapide"
          className="glass3d-btn inline-flex h-8 w-8 items-center justify-center rounded-full"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-2">
        <div
          ref={carouselRef}
          data-no-panel-drag
          className="no-scrollbar relative flex gap-4 overflow-x-auto px-2 py-2 will-change-transform [&.is-swiping_a]:pointer-events-none"
          style={{ touchAction: "pan-x", scrollbarWidth: "none", cursor: "grab" }}
          aria-label="Carrousel de navigation rapide"
        >
          {items.map((item) => (
            <Link key={item.id} to={item.to} className="relative h-40 w-56 flex-shrink-0 overflow-hidden rounded-2xl p-4 text-white ring-1 ring-white/10 transition-transform duration-300 hover:scale-105 focus:scale-105" aria-label={item.title} draggable={false}>
              <div className="absolute inset-0 rounded-2xl backdrop-blur-md" style={{ background: "var(--nav-card-overlay, linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06)))" }} />
              <div className="relative flex h-full w-full flex-col justify-end rounded-xl p-3">
                <div className="z-10 mt-2 text-xl font-extrabold">{item.title}</div>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: item.color }} />
                <div className="absolute bottom-3 left-3 z-10 text-xs text-white/90">Aller →</div>
                <div className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-md bg-white/5">
                  <svg className="h-6 w-6 animate-spin text-white/80 [animation-duration:4s]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" strokeOpacity="0.2" />
                    <path d="M12 4v4" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}