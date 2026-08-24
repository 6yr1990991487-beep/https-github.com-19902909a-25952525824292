import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { applyPanelTint, isPanelTintOn } from "@/lib/panelTint";
import { resetPanelPositions } from "@/lib/panelDrag";
import {
  Bot,
  Compass,
  Film,
  Home,
  LayoutGrid,
  Mail,
  Music2,
  Play,
  Palette,
  Move,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
  X,
  Youtube,
} from "lucide-react";

export const OPEN_MOBILE_MENU_EVENT = "lovanet:open-mobile-menu";

type Item = { to: string; label: string; icon: typeof Home };

const GROUPS: { id: string; label: string; items: Item[] }[] = [
  {
    id: "priority",
    label: "Accès rapide",
    items: [
      { to: "/", label: "Portail", icon: Home },
      { to: "/anime-catalog", label: "Catalogue", icon: Film },
      { to: "/ai-hub", label: "AI", icon: Bot },
      { to: "/prime-video", label: "Prime Vidéo", icon: Play },
      { to: "/shop", label: "Magasin", icon: ShoppingBag },
    ],
  },
  {
    id: "watch",
    label: "Vidéos & plateformes",
    items: [
      { to: "/chaine-youtube", label: "YouTube", icon: Youtube },
      { to: "/tiktok", label: "TikTok", icon: Music2 },
      { to: "/lecteurs-video", label: "Lecteur", icon: Film },
      { to: "/anime-moments", label: "Moments", icon: Sparkles },
    ],
  },
  {
    id: "explore",
    label: "Explorer",
    items: [
      { to: "/univers", label: "Univers", icon: Compass },
      { to: "/actualites", label: "Actualités", icon: Sparkles },
      { to: "/leaderboard", label: "Classement", icon: Trophy },
      { to: "/profile", label: "Profil", icon: User },
      { to: "/contact", label: "Contact", icon: Mail },
    ],
  },
];

/**
 * Bulle du dock : ouvre le menu d'accès rapide (même contenu que la 2e icône
 * du menu mobile) dans un panneau transparent ancré à côté de la barre,
 * dimensionné comme le panneau des thèmes.
 */
export const QuickAccessBubble = () => {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem("lovanet.quickaccess.open") === "1";
    } catch {
      return false;
    }
  });
  const [tint, setTint] = useState(() => (typeof window === "undefined" ? true : isPanelTintOn()));
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Le panneau reste ouvert d'une page à l'autre (mobile, application et PC).
  useEffect(() => {
    try {
      localStorage.setItem("lovanet.quickaccess.open", open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu accès rapide"
        aria-expanded={open}
        data-floating-trigger="quick-access"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white shadow-[0_0_18px_rgba(255,255,255,0.18)] backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/[0.16]"
      >
        {open ? <X className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
      </button>

      {open && typeof document !== "undefined" &&
        createPortal(
          <div
            className="detached-bubble-panel detached-bubble-panel--quick-access glass3d-panel"
            data-panel-key="quick-access"
            role="dialog"
            aria-label="Menu accès rapide"
          >
            <div
              data-panel-drag-handle
              className="glass3d-header sticky top-0 z-10 flex min-h-11 cursor-grab items-center justify-between gap-2 px-3 py-2.5 active:cursor-grabbing"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                <Move className="h-3.5 w-3.5 opacity-70" />
                Accès rapide
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
                aria-label="Fermer le menu accès rapide"
                className="glass3d-btn inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
              </div>
            </div>

            <div className="space-y-3 p-3">
              {GROUPS.map((group) => (
                <div key={group.id} className="glass3d-group rounded-2xl p-2">
                  <p className="px-1 pb-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/60">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`glass3d-btn flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center ${
                            active ? "is-active" : ""
                          }`}
                        >
                          <Icon className="h-4 w-4 text-white" />
                          <span className="line-clamp-1 text-[10px] font-bold uppercase tracking-wide text-white/90">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new CustomEvent(OPEN_MOBILE_MENU_EVENT));
                  }}
                  className="glass3d-btn w-full rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                >
                  Ouvrir le menu complet
                </button>
                <button
                  type="button"
                  onClick={() => resetPanelPositions()}
                  className="glass3d-btn w-full rounded-xl px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/80"
                >
                  Réinitialiser la position des panneaux
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default QuickAccessBubble;
