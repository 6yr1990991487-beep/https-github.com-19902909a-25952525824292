import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  Film,
  Home,
  LayoutGrid,
  Mail,
  Music2,
  Play,
  ShoppingBag,
  Sparkles,
  Trophy,
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
      { to: "/prime-video", label: "Prime Vidéo", icon: Play },
      { to: "/shop", label: "Boutique", icon: ShoppingBag },
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
      { to: "/decouvrir", label: "Univers", icon: Compass },
      { to: "/actualites", label: "Actualités", icon: Sparkles },
      { to: "/leaderboard", label: "Classement", icon: Trophy },
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
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
            className="detached-bubble-panel detached-bubble-panel--quick-access"
            role="dialog"
            aria-label="Menu accès rapide"
          >
            <div className="sticky top-0 z-10 flex min-h-11 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-3 py-2.5 backdrop-blur-xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                Menu accès rapide
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu accès rapide"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white transition hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-3">
              {GROUPS.map((group) => (
                <div key={group.id} className="rounded-2xl border border-white/12 bg-white/[0.04] p-2">
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
                          onClick={() => setOpen(false)}
                          className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center transition-transform hover:scale-[1.03] active:scale-95 ${
                            active
                              ? "border-white/40 bg-white/[0.16]"
                              : "border-white/15 bg-white/[0.06] hover:bg-white/[0.12]"
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

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent(OPEN_MOBILE_MENU_EVENT));
                }}
                className="w-full rounded-xl border border-white/25 bg-white/[0.08] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
              >
                Ouvrir le menu complet
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default QuickAccessBubble;
