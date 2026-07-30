import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Compass,
  Film,
  Home,
  Mail,
  Menu,
  Music2,
  Play,
  ScrollText,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const navTestIds: Record<string, string> = {
  "/": "navbar-home-link",
  "/anime-moments": "navbar-anime-moments-link",
  "/decouvrir": "navbar-discover-link",
  "/shop": "navbar-shop-link",
  "/actualites": "navbar-news-link",
};

const rotatingDestinations = [
  { to: "/", label: "Portail", icon: Home },
  { to: "/anime-moments", label: "Anime Moments", icon: Film },
  { to: "/lecteurs-video", label: "Lecteurs vidéo", icon: Film },
  { to: "/chaine-youtube", label: "YouTube", icon: Youtube },
  { to: "/prime-video", label: "Prime Vidéo", icon: Play },
  { to: "/tiktok", label: "TikTok", icon: Music2 },
  { to: "/anime-countdown", label: "À venir", icon: Play },
  { to: "/anime-catalog", label: "Catalogue", icon: Film },
  { to: "/decouvrir", label: "Univers Lovanet", icon: Compass },
  { to: "/actualites", label: "Actualités", icon: Sparkles },
  { to: "/shop", label: "Boutique", icon: ShoppingBag },
  { to: "/contact", label: "Contact", icon: Mail },
];

const desktopSlotCount = 10;
const menuRotationIntervalMs = 10000;

const getRotatingDestination = (slotIndex: number, rotationIndex: number) =>
  rotatingDestinations[(slotIndex + rotationIndex) % rotatingDestinations.length];

const megaSections = [
  { to: "/", label: "Portail", desc: "Nouvelle landing Lovanet", icon: Home },
  { to: "/anime-moments", label: "Anime Moments", desc: "Page immersive historique", icon: Film },
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

const mobileGroups = [
  {
    id: "explore",
    label: "Explorer",
    items: megaSections.filter((item) => ["/", "/anime-moments", "/decouvrir", "/actualites", "/shop"].includes(item.to)),
  },
  {
    id: "watch",
    label: "Vidéos & plateformes",
    items: megaSections.filter((item) => ["/chaine-youtube", "/chaine-youtube/manga", "/prime-video", "/tiktok", "/lecteurs-video"].includes(item.to)),
  },
  {
    id: "more",
    label: "Plus",
    items: megaSections.filter((item) => ["/anime-countdown", "/anime-catalog", "/contact", "/legals"].includes(item.to)),
  },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [menuRotationIndex, setMenuRotationIndex] = useState(0);
  const megaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const { count, setOpen: setCartOpen } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActivePath = (to: string) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`));

  const rotatingNavItems = Array.from({ length: desktopSlotCount }, (_, index) => getRotatingDestination(index, menuRotationIndex));
  const rotatingCta = getRotatingDestination(desktopSlotCount, menuRotationIndex);
  const quickActions = useMemo(() => {
    const seen = new Set<string>();
    return [rotatingCta, ...rotatingNavItems]
      .filter((item) => {
        if (seen.has(item.to)) return false;
        seen.add(item.to);
        return true;
      })
      .slice(0, 4);
  }, [rotatingCta, rotatingNavItems]);

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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMegaOpen(false);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMenuRotationIndex((value) => (value + 1) % rotatingDestinations.length);
    }, menuRotationIntervalMs);
    return () => window.clearInterval(id);
  }, []);

  const renderLogo = (compact = false) => (
    <Link
      to="/"
      className="group inline-flex min-h-[44px] items-center rounded-full p-0.5"
      aria-label="Lovanet — Portail"
      data-testid="header-home-logo-link"
      onClick={() => setOpen(false)}
    >
      <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-[1.35rem] border border-white/20 bg-white/10 p-[2px] shadow-[0_0_20px_rgba(96,229,255,0.24)] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 group-hover:-rotate-3 group-hover:border-white/35 group-hover:shadow-[0_0_24px_rgba(96,229,255,0.4),0_0_36px_rgba(186,108,255,0.24)] group-active:scale-95">
        <span className="absolute inset-[3px] rounded-[1.1rem] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(255,255,255,0.18)_26%,rgba(89,204,255,0.26)_58%,rgba(86,35,163,0.38)_100%)] opacity-90" />
        <span className="absolute inset-[3px] rounded-[1.1rem] border border-white/20" />
        <span className="absolute -inset-[1px] rounded-[1.4rem] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(94,234,212,0)_0deg,rgba(94,234,212,0.75)_90deg,rgba(186,108,255,0.7)_180deg,rgba(255,255,255,0.12)_270deg,rgba(94,234,212,0)_360deg)] opacity-70 blur-[2px] animate-[rgb-spin_10s_linear_infinite]" />
        <img
          src="/lovanet-logo-custom.png"
          alt="Lovanet"
          className="relative z-10 h-full w-full rounded-[1.1rem] object-contain drop-shadow-[0_0_14px_rgba(255,255,255,0.42)]"
        />
      </span>
      {!compact && (
        <span className="ml-2 hidden text-sm font-black uppercase tracking-[0.18em] sm:inline nav-theme-accent-text">
          Lovanet
        </span>
      )}
    </Link>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-3" data-testid="site-navbar">
        <div className="mx-auto max-w-[1120px]">
          <div className="relative">
            <div className="nav-theme-shell flex min-h-[56px] items-center gap-2 rounded-[1.35rem] px-3 py-2 sm:min-h-[64px] sm:px-4 lg:px-6">
              <div className="flex items-center gap-2" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                {renderLogo()}
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={megaOpen}
                  aria-controls="mega-menu-panel"
                  onClick={() => {
                    cancelClose();
                    setMegaOpen((value) => !value);
                  }}
                  onMouseEnter={() => {
                    cancelClose();
                    setMegaOpen(true);
                  }}
                  className={cn(
                    "nav-theme-chip hidden h-11 w-11 items-center justify-center rounded-full lg:inline-flex",
                    megaOpen && "nav-theme-chip-active rotate-45",
                  )}
                  aria-label="Ouvrir le méga-menu de navigation"
                  data-testid="desktop-mega-menu-button"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={1.7} />
                </button>
              </div>

              <nav className="mx-auto hidden flex-1 items-center justify-center gap-1 overflow-hidden lg:flex">
                {rotatingNavItems.map((item, index) => {
                  const active = isActivePath(item.to);
                  return (
                    <Link
                      key={`desktop-rotating-nav-${index}-${item.to}`}
                      to={item.to}
                      data-testid={`navbar-rotating-link-${index + 1}`}
                      className={cn(
                        "nav-theme-chip nav-3d inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-medium",
                        active && "nav-theme-chip-active",
                      )}
                    >
                      <span key={`desktop-label-${index}-${item.to}-${menuRotationIndex}`} className="inline-block animate-in fade-in zoom-in-95 duration-500 nav-theme-accent-text">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="ml-auto hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => navigate(rotatingCta.to)}
                  className="nav-theme-chip nav-theme-chip-active inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  data-testid="desktop-rotating-cta-button"
                >
                  <span key={`desktop-cta-${rotatingCta.to}-${menuRotationIndex}`} className="inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500 nav-theme-accent-text">
                    {rotatingCta.label}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="nav-theme-chip relative inline-flex h-11 w-11 items-center justify-center rounded-full"
                aria-label={`Ouvrir le panier (${count} article${count > 1 ? "s" : ""})`}
                data-testid="navbar-cart-button"
              >
                <ShoppingCart className="h-4 w-4" />
                {count > 0 && (
                  <span className="nav-theme-active-dot absolute -right-1 -top-1 grid h-[20px] min-w-[20px] place-items-center rounded-full px-1 text-[10px] font-bold text-white">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="nav-theme-chip inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Ouvrir le menu mobile"
                aria-expanded={open}
                data-testid="mobile-nav-open-button"
              >
                <Menu className="h-4 w-4" strokeWidth={1.7} />
              </button>
            </div>

            {megaOpen && (
              <div
                id="mega-menu-panel"
                ref={megaRef}
                role="menu"
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
                className="absolute left-0 right-0 top-full z-[70] mt-3 hidden animate-in fade-in slide-in-from-top-2 duration-300 lg:block"
              >
                <div className="nav-theme-shell relative overflow-hidden rounded-[1.8rem] p-3 sm:p-5 lg:p-6" data-testid="desktop-mega-menu-panel">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,color-mix(in_srgb,var(--nav-theme-accent)_18%,transparent),transparent_24%),radial-gradient(circle_at_84%_14%,color-mix(in_srgb,var(--nav-theme-accent-2)_14%,transparent),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%)]" />
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--nav-theme-muted)]">Navigation rapide</p>
                        <h2 className="mt-2 font-display text-2xl font-black nav-theme-accent-text">Parcours Lovanet</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMegaOpen(false)}
                        className="nav-theme-chip inline-flex h-11 w-11 items-center justify-center rounded-full"
                        aria-label="Fermer le méga-menu"
                        data-testid="desktop-mega-menu-close-button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {megaSections.map((item) => {
                        const active = isActivePath(item.to);
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            role="menuitem"
                            aria-current={active ? "page" : undefined}
                            data-testid={navTestIds[item.to] ?? undefined}
                            onClick={() => setMegaOpen(false)}
                            className={cn(
                              "nav-theme-chip group relative flex min-h-[88px] items-start gap-3 rounded-[1.3rem] p-4 text-left",
                              active && "nav-theme-chip-active",
                            )}
                          >
                            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--nav-theme-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                              <item.icon className="h-4 w-4" strokeWidth={1.8} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold nav-theme-accent-text">{item.label}</span>
                              <span className="mt-1 block text-xs leading-5 text-[var(--nav-theme-muted)]">{item.desc}</span>
                            </span>
                            {active && <span className="nav-theme-active-dot absolute left-0 top-5 h-10 w-1 rounded-r-full" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="mobile-sheet-panel w-[min(100vw,420px)] border-none bg-transparent p-2 shadow-none sm:p-3" data-testid="mobile-nav-sheet">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation mobile Lovanet</SheetTitle>
            <SheetDescription>Navigation principale, accès rapides et liens utiles.</SheetDescription>
          </SheetHeader>
          <div className="nav-theme-shell flex h-full flex-col overflow-hidden rounded-[1.75rem]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
              {renderLogo(true)}
              <div className="flex items-center gap-2">
                <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-[var(--nav-theme-text)]">
                  {count} panier
                </Badge>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="nav-theme-chip inline-flex h-11 w-11 items-center justify-center rounded-full"
                    aria-label="Fermer le menu mobile"
                    data-testid="mobile-nav-close-button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </SheetClose>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`mobile-quick-${item.to}`}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="nav-theme-chip nav-theme-chip-active flex min-h-[54px] items-center gap-3 rounded-2xl px-4 py-3"
                        data-testid={`mobile-nav-quick-action-${index + 1}`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-semibold nav-theme-accent-text">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(true);
                    setOpen(false);
                  }}
                  className="nav-theme-chip flex min-h-[52px] w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
                  data-testid="mobile-nav-quick-action-cart"
                >
                  <span className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--nav-theme-text)]">
                    <ShoppingCart className="h-4 w-4" />
                    Ouvrir le panier
                  </span>
                  <span className="nav-theme-active-dot grid min-h-[28px] min-w-[28px] place-items-center rounded-full px-2 text-[11px] font-bold text-white">
                    {count}
                  </span>
                </button>

                <Separator className="bg-white/10" />

                <Accordion type="multiple" defaultValue={["explore"]} className="space-y-3">
                  {mobileGroups.map((group) => (
                    <AccordionItem key={group.id} value={group.id} className="nav-theme-chip overflow-hidden rounded-[1.35rem] border border-white/10 px-4 py-1">
                      <AccordionTrigger className="py-3 text-sm font-semibold text-[var(--nav-theme-text)] hover:no-underline">
                        {group.label}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="grid gap-2">
                          {group.items.map((item) => {
                            const active = isActivePath(item.to);
                            return (
                              <Link
                                key={`${group.id}-${item.to}`}
                                to={item.to}
                                onClick={() => setOpen(false)}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "nav-theme-chip flex min-h-[50px] items-center justify-between rounded-2xl px-4 py-3 text-sm",
                                  active && "nav-theme-chip-active",
                                )}
                                data-testid={`mobile-nav-link-${item.to.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}`}
                              >
                                <span className="inline-flex items-center gap-3">
                                  <item.icon className="h-4 w-4" />
                                  <span className="font-medium text-[var(--nav-theme-text)]">{item.label}</span>
                                </span>
                                {active ? <span className="nav-theme-active-dot h-2.5 w-2.5 rounded-full" /> : <ChevronRight className="h-4 w-4 text-[var(--nav-theme-muted)]" />}
                              </Link>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <Separator className="bg-white/10" />

                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--nav-theme-muted)]">En rotation</p>
                  <div className="grid gap-2">
                    {rotatingNavItems.slice(0, 5).map((item, index) => (
                      <Link
                        key={`mobile-rotating-${item.to}-${index}`}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="nav-theme-chip flex min-h-[48px] items-center justify-between rounded-2xl px-4 py-3"
                        data-testid={`mobile-rotating-link-${index + 1}`}
                      >
                        <span className="text-sm font-medium text-[var(--nav-theme-text)]">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-[var(--nav-theme-muted)]" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
