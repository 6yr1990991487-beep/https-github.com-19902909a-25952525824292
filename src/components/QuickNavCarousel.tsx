import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import DragScroller from "@/components/DragScroller";

export const OPEN_QUICKNAV_EVENT = "lovanet:open-quicknav";
const OPEN_KEY = "lovanet.quicknav.open";
const MAIN_KEY = "lovanet.quicknav.main.collapsed";
const MINI_KEY = "lovanet.quicknav.mini.collapsed";

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

const LOGIN_ITEM: QuickNavItem = {
  id: "login",
  title: "Se connecter",
  to: "/login",
  color: "linear-gradient(45deg, #00ff9d, #10b981)",
};

const PROFILE_ITEM: QuickNavItem = {
  id: "profile",
  title: "Mon profil",
  to: "/profile",
  color: "linear-gradient(45deg, #00ff9d, #22d3ee)",
};

const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const ROUTE_THUMBS: Record<string, string> = {
  "/": ytThumb("bGFUthZjGd4"),
  "/anime-moments": ytThumb("5Fr9M1GBDBo"),
  "/tiktok": ytThumb("i0Pz8tmOy8o"),
  "/chaine-youtube": ytThumb("E6X7VsKuMsM"),
  "/chaine-youtube/manga": ytThumb("DtEDLCrliHs"),
  "/prime-video": ytThumb("S0BmS2xG8tg"),
  "/lecteurs-video": ytThumb("bGFUthZjGd4"),
  "/anime-countdown": ytThumb("i0Pz8tmOy8o"),
  "/anime-catalog": ytThumb("E6X7VsKuMsM"),
  "/ai-hub": ytThumb("5Fr9M1GBDBo"),
  "/shop": "/products/am-004.svg",
  "/decouvrir": ytThumb("DtEDLCrliHs"),
  "/actualites": ytThumb("S0BmS2xG8tg"),
  "/profile": "/products/am-012.svg",
  "/contact": "/products/am-020.svg",
  "/legals": "/products/am-030.svg",
  "/leaderboard": "/products/am-008.svg",
};

function thumbFor(to: string) {
  return ROUTE_THUMBS[to] ?? ROUTE_THUMBS["/"];
}

export default function QuickNavCarousel({ items = DEFAULT_ITEMS, onClose }: { items?: QuickNavItem[]; onClose?: () => void }) {
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(true);
  const [mainCollapsed, setMainCollapsed] = useState(() => {
    try {
      return localStorage.getItem(MAIN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [miniCollapsed, setMiniCollapsed] = useState(() => {
    try {
      return localStorage.getItem(MINI_KEY) === "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const openIt = () => setOpen(true);
    const toggleIt = () => setOpen((value) => !value);
    window.addEventListener(OPEN_QUICKNAV_EVENT, openIt as EventListener);
    window.addEventListener("quicknav:toggle", toggleIt as EventListener);
    return () => {
      window.removeEventListener(OPEN_QUICKNAV_EVENT, openIt as EventListener);
      window.removeEventListener("quicknav:toggle", toggleIt as EventListener);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session)));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const navItems = [...items, signedIn ? PROFILE_ITEM : LOGIN_ITEM];
  const primaryItems = useMemo(() => navItems.slice(0, 6), [navItems]);
  const secondaryItems = useMemo(() => navItems.slice(6), [navItems]);

  useEffect(() => {
    try { localStorage.setItem(OPEN_KEY, open ? "1" : "0"); } catch { /* ignore */ }
  }, [open]);

  useEffect(() => {
    try {
      localStorage.setItem(MAIN_KEY, mainCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [mainCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(MINI_KEY, miniCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [miniCollapsed]);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="quicknav-floating glass3d-panel glass3d-surface" data-panel-key="quick-nav" data-collapsed={!open ? "true" : "false"} role="dialog" aria-label="Navigation rapide">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className="quicknav-floating__edge-toggle"
        aria-label={open ? "Réduire le carrousel de navigation" : "Ouvrir le carrousel de navigation"}
      >
        {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {open && (
        <div className="quicknav-floating__stack">
          <div className="quicknav-floating__topbar glass3d-header flex items-center justify-between gap-2 px-3 py-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/82">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              Menu carrousel
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Fermer la navigation rapide"
              className="glass3d-btn inline-flex h-8 w-8 items-center justify-center rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <section className="quicknav-floating__section">
            <button
              type="button"
              onClick={() => setMainCollapsed((value) => !value)}
              className="quicknav-floating__section-toggle"
              aria-label={mainCollapsed ? "Ouvrir le carrousel complet" : "Replier le carrousel complet"}
            >
              <span>Menu complet</span>
              {mainCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <AnimatePresence initial={false}>
              {!mainCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }} className="overflow-hidden">
                  <DragScroller className="quicknav-floating__main-carousel no-scrollbar relative flex gap-3 px-2 py-2" data-testid="quicknav-main-carousel">
                    {primaryItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.to}
                        className="quicknav-card quicknav-card--full group relative h-36 w-56 flex-shrink-0 overflow-hidden rounded-2xl p-4 text-white"
                        aria-label={item.title}
                        draggable={false}
                      >
                        <div className="absolute inset-0 rounded-2xl backdrop-blur-md" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.08))" }} />
                        <div className="relative flex h-full w-full flex-col justify-end rounded-xl p-3">
                          <div className="z-10 mt-2 text-lg font-extrabold leading-tight">{item.title}</div>
                          <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-20 blur-2xl" style={{ background: item.color }} />
                          <div className="absolute bottom-3 left-3 z-10 text-xs text-white/90">Aller →</div>
                          <motion.div className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-md bg-white/5" whileHover={{ rotate: 360, scale: 1.08 }} transition={{ duration: 0.6 }}>
                            <svg className="h-6 w-6 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                              <circle cx="12" cy="12" r="8" strokeOpacity="0.2" />
                              <path d="M12 4v4" />
                            </svg>
                          </motion.div>
                        </div>
                      </Link>
                    ))}
                  </DragScroller>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="quicknav-floating__section">
            <button
              type="button"
              onClick={() => setMiniCollapsed((value) => !value)}
              className="quicknav-floating__section-toggle"
              aria-label={miniCollapsed ? "Ouvrir le carrousel miniature" : "Replier le carrousel miniature"}
            >
              <span>Miniatures</span>
              {miniCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <AnimatePresence initial={false}>
              {!miniCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }} className="overflow-hidden">
                  <DragScroller className="quicknav-floating__mini-carousel no-scrollbar flex gap-2 px-2 py-2" data-testid="quicknav-mini-carousel">
                    {secondaryItems.map((item) => {
                      const thumb = thumbFor(item.to);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={`mini-${item.id}`}
                          to={item.to}
                          className="quicknav-card quicknav-card--mini group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] text-white"
                          aria-label={item.title}
                          draggable={false}
                        >
                          <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-72" loading="lazy" />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.14),rgba(2,6,23,0.56))]" />
                          <div className="absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/12 shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                            <motion.div whileHover={{ rotate: 360, scale: 1.14 }} transition={{ duration: 0.6 }}>
                              <Icon className="h-3.5 w-3.5 text-white" />
                            </motion.div>
                          </div>
                          <div className="absolute inset-x-2 bottom-2 z-10 text-[10px] font-bold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] line-clamp-2">
                            {item.title}
                          </div>
                        </Link>
                      );
                    })}
                  </DragScroller>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      )}
    </div>,
    document.body,
  );
}