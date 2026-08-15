import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { applyPanelTint, isPanelTintOn } from "@/lib/panelTint";
import { SHOP_CATEGORIES } from "@/data/shopProducts";
import {
  ShoppingBag,
  Store,
  Sparkles,
  X,
  Palette,
  Move,
  ArrowRight,
} from "lucide-react";

export const OPEN_SHOP_EVENT = "lovanet:open-shop-panel";

/**
 * Bulle du dock : remplace le panneau de couleurs du menu mobile par un
 * accès rapide Magasin qui redirige vers la magasin.
 */
export const MagasinQuickBubble = () => {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem("lovanet.magasin.open") === "1";
    } catch {
      return false;
    }
  });
  const [tint, setTint] = useState(() => (typeof window === "undefined" ? true : isPanelTintOn()));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_SHOP_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SHOP_EVENT, onOpen);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lovanet.magasin.open", open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Accès rapide Magasin"
        aria-expanded={open}
        data-floating-trigger="magasin"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white shadow-[0_0_18px_rgba(255,255,255,0.18)] backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/[0.16]"
      >
        {open ? <X className="h-5 w-5" /> : <Store className="h-5 w-5" />}
      </button>

      {open && typeof document !== "undefined" &&
        createPortal(
          <div
            className="detached-bubble-panel detached-bubble-panel--magasin glass3d-panel"
            data-panel-key="magasin"
            role="dialog"
            aria-label="Accès rapide Magasin"
          >
            <div
              data-panel-drag-handle
              className="glass3d-header sticky top-0 z-10 flex min-h-11 cursor-grab items-center justify-between gap-2 px-3 py-2.5 active:cursor-grabbing"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                <Move className="h-3.5 w-3.5 opacity-70" />
                Magasin
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = !tint;
                    setTint(next);
                    applyPanelTint(next);
                  }}
                  aria-pressed={tint}
                  title={tint ? "Couleurs du thème activées" : "Couleurs du thème désactivées"}
                  className={`glass3d-btn inline-flex h-8 w-8 items-center justify-center rounded-full ${tint ? "is-active" : ""}`}
                >
                  <Palette className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le panneau Magasin"
                  className="glass3d-btn inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 p-3">
              <Link
                to="/shop"
                className="glass3d-btn flex items-center justify-between rounded-2xl px-4 py-3"
                onClick={() => setOpen(false)}
              >
                <span className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] text-white">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Voir la magasin
                </span>
                <ArrowRight className="h-4 w-4 text-white/70" />
              </Link>

              <div className="glass3d-group rounded-2xl p-2">
                <p className="px-1 pb-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/60">
                  Catégories
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SHOP_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.id}`}
                      className="glass3d-btn flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center"
                      onClick={() => setOpen(false)}
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                      <span className="line-clamp-1 text-[10px] font-bold uppercase tracking-wide text-white/90">
                        {cat.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default MagasinQuickBubble;
