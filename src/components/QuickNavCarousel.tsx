import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, BookOpen, Sparkles, Youtube, ShoppingBag, Video, Newspaper, Trophy, User, LogIn, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import DragScroller from "@/components/DragScroller";

export const OPEN_QUICKNAV_EVENT = "lovanet:open-quicknav";
const MAIN_KEY = "lovanet.quicknav.main.collapsed";
const MINI_KEY = "lovanet.quicknav.mini.collapsed";
const POS_KEY = "lovanet.quicknav.position";

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

const MINI_ICON_BY_ID: Record<string, LucideIcon> = {
  home: Home,
  catalog: BookOpen,
  ai: Sparkles,
  youtube: Youtube,
  shop: ShoppingBag,
  prime: Video,
  news: Newspaper,
  leader: Trophy,
  profile: User,
  login: LogIn,
};

const MINI_TINT_BY_ID: Record<string, string> = {
  home: "from-cyan-400/45 to-indigo-500/45",
  catalog: "from-amber-400/45 to-rose-500/45",
  ai: "from-emerald-400/45 to-sky-400/45",
  youtube: "from-green-400/45 to-emerald-600/45",
  shop: "from-pink-400/45 to-violet-500/45",
  prime: "from-sky-400/45 to-blue-700/45",
  news: "from-violet-400/45 to-purple-700/45",
  leader: "from-fuchsia-400/45 to-red-500/45",
  profile: "from-emerald-400/45 to-cyan-500/45",
  login: "from-emerald-300/45 to-teal-500/45",
};

export default function QuickNavCarousel({ items = DEFAULT_ITEMS, onClose }: { items?: QuickNavItem[]; onClose?: () => void }) {
  const [signedIn, setSignedIn] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dockPos, setDockPos] = useState<{ x: number; y: number; dragged: boolean }>(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (!raw) return { x: 0, y: 0, dragged: false };
      const parsed = JSON.parse(raw) as { x?: number; y?: number; dragged?: boolean };
      if (typeof parsed.x === "number" && typeof parsed.y === "number" && parsed.dragged) {
        return { x: parsed.x, y: parsed.y, dragged: true };
      }
    } catch {
      /* ignore */
    }
    return { x: 0, y: 0, dragged: false };
  });
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
    const closeIt = () => {
      setLeftOpen(false);
      setRightOpen(false);
    };
    window.addEventListener("quicknav:close", closeIt as EventListener);
    return () => {
      window.removeEventListener("quicknav:close", closeIt as EventListener);
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
  const rightItems = useMemo(() => [...primaryItems, ...secondaryItems], [primaryItems, secondaryItems]);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const clampPosition = (x: number, y: number) => {
    if (typeof window === "undefined") return { x, y };
    const node = dockRef.current;
    const margin = 8;
    const width = node?.offsetWidth ?? 320;
    const height = node?.offsetHeight ?? 260;
    const maxX = Math.max(margin, window.innerWidth - width - margin);
    const maxY = Math.max(margin, window.innerHeight - height - margin);
    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  };

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

  useEffect(() => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(dockPos));
    } catch {
      /* ignore */
    }
  }, [dockPos]);

  useEffect(() => {
    if (!dockPos.dragged) return;
    const onResize = () => setDockPos((prev) => ({ ...clampPosition(prev.x, prev.y), dragged: true }));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [dockPos.dragged]);

  useEffect(() => {
    if (!rightOpen) return;

    const scroller = document.querySelector('[data-testid="quicknav-right-carousel"]') as HTMLDivElement | null;
    if (!scroller) return;

    let raf = 0;
    let direction: -1 | 1 = -1;
    let pauseFrames = 14;

    const toRightEdge = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    scroller.scrollLeft = toRightEdge();

    const tick = () => {
      const max = toRightEdge();
      if (max <= 0) {
        raf = window.requestAnimationFrame(tick);
        return;
      }

      if (pauseFrames > 0) {
        pauseFrames -= 1;
        raf = window.requestAnimationFrame(tick);
        return;
      }

      if (direction === -1) {
        scroller.scrollLeft = Math.max(0, scroller.scrollLeft - 0.38);
        if (scroller.scrollLeft <= 0.5) {
          direction = 1;
          pauseFrames = 18;
        }
      } else {
        scroller.scrollLeft = Math.min(max, scroller.scrollLeft + 0.95);
        if (scroller.scrollLeft >= max - 0.5) {
          setRightOpen(false);
          return;
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [rightOpen, rightItems.length]);

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, [data-no-panel-drag]")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rect = dockRef.current?.getBoundingClientRect();
    const baseX = dockPos.dragged ? dockPos.x : (rect?.left ?? 14);
    const baseY = dockPos.dragged ? dockPos.y : (rect?.top ?? 120);

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX,
      baseY,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = dragRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const next = clampPosition(session.baseX + (event.clientX - session.startX), session.baseY + (event.clientY - session.startY));
    setDockPos({ ...next, dragged: true });
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = dragRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const closeLeft = () => {
    setLeftOpen(false);
    onClose?.();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
    <div
      ref={dockRef}
      className="quicknav-floating quicknav-floating--left glass3d-panel glass3d-surface"
      data-panel-key="quick-nav"
      data-collapsed={!leftOpen ? "true" : "false"}
      data-dragged={dockPos.dragged ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
      role="dialog"
      aria-label="Navigation rapide"
      style={dockPos.dragged ? { left: `${dockPos.x}px`, top: `${dockPos.y}px`, transform: "none" } : undefined}
    >
      <button
        type="button"
        onClick={() => (leftOpen ? closeLeft() : setLeftOpen(true))}
        className="quicknav-floating__edge-toggle"
        aria-label={leftOpen ? "Réduire le menu récent" : "Ouvrir le menu récent"}
      >
        {leftOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {leftOpen && (
        <div className="quicknav-floating__stack">
          <div
            className="quicknav-floating__topbar glass3d-header flex items-center justify-between gap-2 px-3 py-2"
            onPointerDown={beginDrag}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/82">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              Menu recent
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Glisser</div>
          </div>

          <section className="quicknav-floating__section">
            <button
              type="button"
              onClick={() => setMainCollapsed((value) => !value)}
              className="quicknav-floating__section-toggle"
              aria-label={mainCollapsed ? "Ouvrir le carrousel complet" : "Replier le carrousel complet"}
            >
              <span className="sr-only">Menu complet</span>
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
              <span className="sr-only">Miniatures</span>
              {miniCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <AnimatePresence initial={false}>
              {!miniCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }} className="overflow-hidden">
                  <DragScroller className="quicknav-floating__mini-carousel no-scrollbar flex gap-2 px-2 py-2" data-testid="quicknav-mini-carousel">
                    {secondaryItems.map((item) => {
                      const MiniIcon = MINI_ICON_BY_ID[item.id] ?? Sparkles;
                      const tint = MINI_TINT_BY_ID[item.id] ?? "from-cyan-400/45 to-indigo-500/45";
                      const badge = item.title.slice(0, 1).toUpperCase();
                      return (
                        <Link
                          key={`mini-${item.id}`}
                          to={item.to}
                          className="quicknav-card quicknav-card--mini group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] text-white"
                          aria-label={item.title}
                          draggable={false}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${tint}`} />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_52%),linear-gradient(180deg,rgba(2,6,23,0.14),rgba(2,6,23,0.56))]" />
                          <motion.div
                            className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/20 blur-sm"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                          />
                          <div className="absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/12 shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                            <motion.div whileHover={{ rotate: 360, scale: 1.14 }} transition={{ duration: 0.6 }}>
                              <MiniIcon className="h-3.5 w-3.5 text-white" />
                            </motion.div>
                          </div>
                          <div className="absolute right-2 top-2 rounded-full border border-white/25 bg-black/25 px-1.5 py-0.5 text-[9px] font-black text-white/90">{badge}</div>
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
    </div>

    <div
      className="quicknav-floating quicknav-floating--right quicknav-floating--top glass3d-panel glass3d-surface"
      data-panel-key="quick-nav-right"
      data-collapsed={!rightOpen ? "true" : "false"}
      role="dialog"
      aria-label="Carrousel defilant"
    >
      <button
        type="button"
        onClick={() => setRightOpen((value) => !value)}
        className="quicknav-floating__edge-toggle"
        aria-label={rightOpen ? "Fermer le carrousel defilant" : "Ouvrir le carrousel defilant"}
      >
        {rightOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {rightOpen && (
        <div className="quicknav-floating__stack">
          <div className="quicknav-floating__topbar glass3d-header flex items-center justify-between gap-2 px-3 py-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/82">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              Defilant
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Auto</div>
          </div>

          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <DragScroller className="quicknav-floating__mini-carousel no-scrollbar flex gap-2 px-2 py-2" data-testid="quicknav-right-carousel">
              {rightItems.map((item) => {
                const MiniIcon = MINI_ICON_BY_ID[item.id] ?? Sparkles;
                const tint = MINI_TINT_BY_ID[item.id] ?? "from-cyan-400/45 to-indigo-500/45";
                const badge = item.title.slice(0, 1).toUpperCase();
                return (
                  <Link
                    key={`right-mini-${item.id}`}
                    to={item.to}
                    className="quicknav-card quicknav-card--mini group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] text-white"
                    aria-label={item.title}
                    draggable={false}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tint}`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_52%),linear-gradient(180deg,rgba(2,6,23,0.14),rgba(2,6,23,0.56))]" />
                    <motion.div
                      className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/20 blur-sm"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                    />
                    <div className="absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/12 shadow-[0_0_14px_rgba(255,255,255,0.12)]">
                      <motion.div whileHover={{ rotate: 360, scale: 1.14 }} transition={{ duration: 0.6 }}>
                        <MiniIcon className="h-3.5 w-3.5 text-white" />
                      </motion.div>
                    </div>
                    <div className="absolute right-2 top-2 rounded-full border border-white/25 bg-black/25 px-1.5 py-0.5 text-[9px] font-black text-white/90">{badge}</div>
                    <div className="absolute inset-x-2 bottom-2 z-10 text-[10px] font-bold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] line-clamp-2">
                      {item.title}
                    </div>
                  </Link>
                );
              })}
            </DragScroller>
          </motion.div>
        </div>
      )}
    </div>
    </>,
    document.body,
  );
}