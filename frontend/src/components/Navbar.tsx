import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, ShoppingBag, Youtube, Play, Music2, Film, Mail, Compass, ShoppingCart, Home, ScrollText } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/lecteurs-video", label: "Lecteurs vidéo" },
  { to: "/chaine-youtube", label: "YouTube" },
  { to: "/prime-video", label: "Prime Vidéo" },
  { to: "/tiktok", label: "TikTok" },
  { to: "/anime-countdown", label: "À venir" },
  { to: "/anime-catalog", label: "Catalogue" },
  { to: "/decouvrir", label: "Univers Lovanet" },
  { to: "/actualites", label: "Actualités" },
  { to: "/shop", label: "Shop" },
];

const extraItems = [
  { to: "/contact", label: "Contact" },
];

const megaSections = [
  { to: "/", label: "Accueil", desc: "Page d'accueil Lovanet", icon: Home },
  { to: "/shop", label: "Boutique", desc: "Affiches, collectors, vêtements", icon: ShoppingBag },
  { to: "/tiktok", label: "TikTok", desc: "Shorts & réactions", icon: Music2 },
  { to: "/chaine-youtube", label: "YouTube", desc: "Vidéos & shorts officiels", icon: Youtube },
  { to: "/chaine-youtube/manga", label: "YouTube Manga", desc: "Chaîne dédiée manga", icon: Youtube },
  { to: "/prime-video", label: "Prime Vidéo", desc: "Lecture immersive multi-plateforme", icon: Play },
  { to: "/lecteurs-video", label: "Lecteur vidéo", desc: "Player immersif anime", icon: Film },
  { to: "/anime-countdown", label: "Animés à venir", desc: "Countdown live des prochains épisodes", icon: Play },
  { to: "/anime-catalog", label: "Catalogue Animés", desc: "Carrousel 3D tendances", icon: Film },
  { to: "/decouvrir", label: "Univers Lovanet", desc: "Vitrine SEO produits & vidéos", icon: Compass },
  { to: "/actualites", label: "Actualités", desc: "News anime, vidéos, produits", icon: Sparkles },
  { to: "/contact", label: "Contact", desc: "Écrire à l'équipe", icon: Mail },
  { to: "/legals", label: "Mentions légales", desc: "CGV & confidentialité", icon: ScrollText },
];


export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const { count, setOpen: setCartOpen } = useCart();
  const { pathname } = useLocation();
  const isActivePath = (to: string) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/"));

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container mx-auto px-4 lg:px-8 h-12 flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-2 shrink-0"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <Link
            to="/"
            className="tilt-card btn-magnetic flex items-center group rounded-full p-0.5"
            aria-label="Lovanet — Accueil"
            data-testid="header-home-logo-link"
          >
            <img
              src="/lovanet-logo-custom.png"
              alt="Lovanet"
              className="h-10 w-10 rounded-[1.35rem] object-contain p-0.5 bg-white/5 ring-1 ring-white/20 backdrop-blur-xl shadow-[0_0_20px_hsl(var(--neon-cyan)/0.4)] transition-[transform,box-shadow,border-color] duration-300 group-hover:ring-white/40 group-hover:shadow-[0_0_28px_hsl(var(--neon-cyan)/0.7),0_0_44px_hsl(var(--neon-purple)/0.5)] group-hover:rotate-[-4deg] group-active:scale-95"
            />
            <span className="ml-2 font-display text-sm font-bold tracking-[0.15em] gradient-text hidden sm:inline">
              Lovanet
            </span>
          </Link>
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={megaOpen}
            aria-controls="mega-menu-panel"
            onClick={() => setMegaOpen((v) => !v)}
            onMouseEnter={() => { cancelClose(); setMegaOpen(true); }}
            className={cn(
              "ml-1 group inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-xl text-white/85 hover:text-white hover:border-white/40 hover:bg-white/[0.12] transition-all duration-300 hover:shadow-[0_0_22px_hsl(var(--neon-cyan)/0.55)]",
              megaOpen && "border-white/50 text-white bg-white/[0.14] shadow-[0_0_24px_hsl(var(--neon-cyan)/0.7)] rotate-45"
            )}
            aria-label="Ouvrir le méga-menu de navigation"
          >
            <Sparkles className="w-4 h-4 transition-transform duration-500 group-hover:rotate-12" strokeWidth={1.6} />
          </button>
        </div>

        <nav className="hidden lg:flex items-center gap-1 mx-auto perspective-[800px]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "nav-3d btn-magnetic relative px-4 py-2 text-sm rounded-full transition-all duration-300 hover:-translate-y-0.5",
                  isActive
                    ? "neon-rgb-text bg-white/[0.09] border border-white/25 backdrop-blur-xl shadow-[0_0_18px_hsl(var(--neon-cyan)/0.5),inset_0_1px_0_rgba(255,255,255,0.15)]"
                    : "neon-rgb-text-soft hover:drop-shadow-[0_0_10px_hsl(var(--neon-cyan)/0.7)]"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/shop"
          className="btn-magnetic tilt-card hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold text-white shadow-[0_8px_24px_-6px_hsl(var(--neon-magenta)/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.05] hover:shadow-[0_14px_36px_-8px_hsl(var(--neon-magenta)/0.85),0_0_28px_hsl(var(--neon-cyan)/0.5)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          style={{ background: "var(--gradient-magenta)" }}
        >
          Boutique
        </Link>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/60 backdrop-blur hover:border-primary/60 hover:text-primary transition-all"
          aria-label={`Ouvrir le panier (${count} article${count > 1 ? "s" : ""})`}
        >
          <ShoppingCart className="w-4 h-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white grid place-items-center shadow-md" style={{ background: "var(--gradient-magenta)" }}>
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
        <button
          className={cn(
            "lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-xl text-white/85 hover:text-white hover:border-white/40 hover:bg-white/[0.12] transition-all duration-300",
            open && "border-white/50 text-white bg-white/[0.14] shadow-[0_0_22px_hsl(var(--neon-cyan)/0.6)]"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="w-4 h-4" strokeWidth={1.6} /> : <Menu className="w-4 h-4" strokeWidth={1.6} />}
        </button>
      </div>

      {/* Mega menu panel */}
      {megaOpen && (
        <div
          id="mega-menu-panel"
          ref={megaRef}
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute left-0 right-0 top-full mt-2 mx-auto px-3 sm:px-4 lg:px-8 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="container mx-auto">
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl shadow-[0_20px_80px_-20px_hsl(var(--neon-magenta)/0.35),0_0_0_1px_rgba(255,255,255,0.04)_inset] p-3 sm:p-5 lg:p-6 overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
              <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl animate-pulse-glow" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl animate-pulse-glow" />
              <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-white/70 font-display flex items-center gap-2">
                  <Sparkles className="w-3 h-3 neon-rgb-icon" strokeWidth={1.8} />
                  <span className="neon-rgb-text">Menu Lovanet</span>
                </p>
                <button
                  onClick={() => setMegaOpen(false)}
                  className="p-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 backdrop-blur transition-all"
                  aria-label="Fermer le méga-menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {megaSections.map((s) => {
                  const active = isActivePath(s.to);
                  return (
                    <Link
                      key={s.to}
                      to={s.to}
                      role="menuitem"
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMegaOpen(false)}
                      className={cn(
                        "group relative flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.98] overflow-hidden",
                        active
                          ? "border-white/40 bg-white/[0.12] shadow-[0_10px_30px_-14px_hsl(var(--neon-cyan)/0.7),inset_0_1px_0_rgba(255,255,255,0.18)]"
                          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/25 hover:shadow-[0_14px_34px_-14px_hsl(var(--neon-cyan)/0.55)]"
                      )}
                    >
                      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-fuchsia-400/10 via-transparent to-cyan-400/10" />
                      {active && (
                        <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gradient-to-b from-fuchsia-400 to-cyan-400 shadow-[0_0_10px_hsl(var(--neon-cyan)/0.7)]" />
                      )}
                      <span className={cn(
                        "shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/30 group-hover:scale-110 group-hover:rotate-[-4deg]",
                        active ? "text-white bg-white/10 border-white/30" : "text-white/85 group-hover:text-white"
                      )}>
                        <s.icon className="w-[18px] h-[18px] neon-rgb-icon" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 relative">
                        <span className={cn(
                          "block font-display font-semibold text-[13px] sm:text-sm transition-colors leading-tight neon-rgb-text",
                        )}>
                          {s.label}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer — glass transparent */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-12 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden absolute left-0 right-0 top-full mt-2 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl shadow-[0_20px_80px_-20px_hsl(var(--neon-magenta)/0.4),0_0_0_1px_rgba(255,255,255,0.04)_inset] overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="relative p-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/70 font-display flex items-center gap-2 px-2 pb-2 pt-1">
                  <Sparkles className="w-3 h-3 neon-rgb-icon" strokeWidth={1.8} />
                  <span className="neon-rgb-text">Navigation</span>
                </p>
                <nav className="grid gap-1.5">
                  {megaSections.map((s) => {
                    const active = isActivePath(s.to);
                    return (
                      <NavLink
                        key={s.to}
                        to={s.to}
                        end={s.to === "/"}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2.5 rounded-2xl border backdrop-blur-xl transition-all duration-300 active:scale-[0.98]",
                          active
                            ? "border-white/40 bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_18px_hsl(var(--neon-cyan)/0.4)]"
                            : "border-white/10 bg-white/[0.03] text-white/90 hover:bg-white/[0.08] hover:border-white/25"
                        )}
                      >
                        <span className={cn(
                          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
                          active && "bg-white/10 border-white/30"
                        )}>
                          <s.icon className="w-[18px] h-[18px] neon-rgb-icon" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display font-semibold text-sm leading-tight neon-rgb-text">{s.label}</span>
                        </span>
                        {active && (
                          <span className="shrink-0 h-2 w-2 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 shadow-[0_0_10px_hsl(var(--neon-cyan)/0.7)]" />
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};