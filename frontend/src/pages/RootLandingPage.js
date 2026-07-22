import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Compass, Film, Newspaper, Play, ShoppingBag, Star, Youtube } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { RecentEpisodesCarousel } from "@/components/RecentEpisodesCarousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO_NEWS } from "@/data/seoNews";
import heroImage from "@/assets/anime-moments-hero.jpg";
import mangaBanner from "@/assets/manga-banner.jpg";
import portalButtonsZoneVideo from "@/assets/portal-buttons-zone-video.mp4";
import portalZoneReplacement from "@/assets/portal-zone-replacement.mp4";

const rotatingPortalDestinations = [
  { to: "/anime-moments", label: "Anime Moments", icon: Film },
  { to: "/decouvrir", label: "Univers Lovanet", icon: Compass },
  { to: "/actualites", label: "Actualités", icon: Newspaper },
  { to: "/shop", label: "Boutique", icon: ShoppingBag },
  { to: "/chaine-youtube", label: "YouTube", icon: Youtube },
  { to: "/prime-video", label: "Prime Vidéo", icon: Play },
  { to: "/tiktok", label: "TikTok", icon: Play },
  { to: "/anime-catalog", label: "Catalogue", icon: Star },
  { to: "/anime-countdown", label: "À venir", icon: Play },
  { to: "/lecteurs-video", label: "Lecteurs vidéo", icon: Film },
  { to: "/contact", label: "Contact", icon: Newspaper },
];

const portalCards = [
  { title: "Portail A", subtitle: "Rotation", image: heroImage, testId: "home-portal-anime-moments-card" },
  { title: "Portail B", subtitle: "Rotation", image: mangaBanner, testId: "home-portal-discover-card" },
  { title: "Portail C", subtitle: "Rotation", image: heroImage, testId: "home-portal-news-card" },
  { title: "Portail D", subtitle: "Rotation", image: mangaBanner, testId: "home-portal-shop-card" },
];

const platformCards = [
  { title: "Plateforme A", testId: "home-platform-youtube-card" },
  { title: "Plateforme B", testId: "home-platform-tiktok-card" },
  { title: "Plateforme C", testId: "home-platform-prime-card" },
  { title: "Plateforme D", testId: "home-platform-catalog-card" },
];

const featuredNews = SEO_NEWS.slice(0, 3).map((item, index) => ({
  ...item,
  href: item.category === "product" ? "/shop" : item.sourcePath || "/actualites",
  testId: `home-news-card-${index + 1}`,
}));

const pageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Lovanet : portail anime manga futuriste",
  description: "Portail Lovanet pour explorer Anime Moments, les vidéos, les actualités et la boutique collector.",
  url: "https://lovanet.fr/",
};

const luxurySection =
  "relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] backdrop-blur-2xl shadow-[0_24px_90px_-28px_hsl(var(--neon-magenta)/0.32),0_0_0_1px_rgba(255,255,255,0.05)_inset]";
const luxuryCard =
  "group relative overflow-hidden rounded-[1.9rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl shadow-[0_18px_60px_-24px_hsl(var(--neon-magenta)/0.26)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_22px_78px_-24px_hsl(var(--neon-cyan)/0.36)]";
const luxuryGlowLeft =
  "pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-400/18 blur-3xl";
const luxuryGlowRight =
  "pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-400/18 blur-3xl";
const secondaryButton =
  "rounded-full border border-white/20 bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_32px_-18px_rgba(0,0,0,0.55)] backdrop-blur-xl hover:border-white/35 hover:bg-white/[0.12] hover:shadow-[0_16px_36px_-18px_rgba(90,220,255,0.45)]";
const luxuryIcon =
  "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] text-white";
const portalRotationIntervalMs = 10000;
const embeddedHeroCaptureVideo = "/root-capture-video-latest.mp4";
const bannerVideoSequence = [
  embeddedHeroCaptureVideo,
  "/banner-seq-2.mp4",
  "/banner-seq-3.mp4",
];


const getPortalDestination = (slotIndex, rotationIndex) =>
  rotatingPortalDestinations[(slotIndex + rotationIndex) % rotatingPortalDestinations.length];

export default function RootLandingPage() {
  const [rotationIndex, setRotationIndex] = useState(0);
  const [activeBannerVideoIndex, setActiveBannerVideoIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const bannerVideoRef = useRef(null);
  const bannerShellRef = useRef(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRotationIndex((value) => (value + 1) % rotatingPortalDestinations.length);
    }, portalRotationIntervalMs);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const video = bannerVideoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setActiveBannerVideoIndex((current) => (current + 1) % bannerVideoSequence.length);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [activeBannerVideoIndex]);

  useEffect(() => {
    const video = bannerVideoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, [activeBannerVideoIndex]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setReducedMotion(media.matches);
    syncReduced();
    media.addEventListener?.("change", syncReduced);

    const shell = bannerShellRef.current;
    if (!shell || media.matches) {
      return () => media.removeEventListener?.("change", syncReduced);
    }

    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    let drift = 0;
    let running = true;

    const update = () => {
      if (!running) return;
      drift += 0.018;
      const droneX = Math.sin(drift) * 10;
      const droneY = Math.cos(drift * 0.75) * 8;
      const tiltX = (-pointerY * 7) + Math.cos(drift * 0.6) * 2.5;
      const tiltY = (pointerX * 10) + Math.sin(drift * 0.9) * 3;
      shell.style.setProperty("--banner-rotate-x", `${tiltX.toFixed(2)}deg`);
      shell.style.setProperty("--banner-rotate-y", `${tiltY.toFixed(2)}deg`);
      shell.style.setProperty("--banner-shift-x", `${droneX.toFixed(2)}px`);
      shell.style.setProperty("--banner-shift-y", `${droneY.toFixed(2)}px`);
      shell.style.setProperty("--banner-glow-x", `${50 + pointerX * 18}%`);
      shell.style.setProperty("--banner-glow-y", `${42 + pointerY * 16}%`);
      frame = window.requestAnimationFrame(update);
    };

    const onPointerMove = (event) => {
      const rect = shell.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointerX = (x - 0.5) * 2;
      pointerY = (y - 0.5) * 2;
    };

    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    shell.addEventListener("pointermove", onPointerMove);
    shell.addEventListener("pointerleave", onPointerLeave);
    frame = window.requestAnimationFrame(update);

    return () => {
      running = false;
      shell.removeEventListener("pointermove", onPointerMove);
      shell.removeEventListener("pointerleave", onPointerLeave);
      window.cancelAnimationFrame(frame);
      media.removeEventListener?.("change", syncReduced);
    };
  }, []);

  const heroPrimary = useMemo(() => getPortalDestination(0, rotationIndex), [rotationIndex]);
  const heroSecondary = useMemo(() => getPortalDestination(1, rotationIndex), [rotationIndex]);
  const heroNews = useMemo(() => getPortalDestination(2, rotationIndex), [rotationIndex]);
  const portalEntries = useMemo(() => portalCards.map((card, index) => ({ ...card, action: getPortalDestination(index, rotationIndex) })), [rotationIndex]);
  const platformEntries = useMemo(() => platformCards.map((card, index) => ({ ...card, action: getPortalDestination(index + 4, rotationIndex) })), [rotationIndex]);
  const featuredVideoAction = useMemo(() => getPortalDestination(5, rotationIndex), [rotationIndex]);
  const newsAction = useMemo(() => getPortalDestination(6, rotationIndex), [rotationIndex]);

  return (
    <PageShell>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(pageStructuredData)}</script>
      </Helmet>

      <div className="relative overflow-hidden" data-testid="root-landing-page">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_20%)]" />

        <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-24 lg:pt-20">
          <div className={`${luxurySection} p-5 sm:p-7 lg:p-10`}>
            <div className={luxuryGlowLeft} />
            <div className={luxuryGlowRight} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,transparent_65%,rgba(255,255,255,0.03))]" />
            <div
              ref={bannerShellRef}
              className="hero-banner-3d relative overflow-hidden rounded-[2rem] min-h-[460px]"
              data-testid="root-landing-hero-banner-shell"
            >
              <video
                ref={bannerVideoRef}
                key={bannerVideoSequence[activeBannerVideoIndex]}
                className="hero-banner-video absolute inset-0 h-full w-full object-cover object-center"
                src={bannerVideoSequence[activeBannerVideoIndex]}
                autoPlay
                muted
                playsInline
                preload="metadata"
                data-testid="hero-banner-background-video"
              />
              <div className="hero-banner-darken pointer-events-none absolute inset-0" />
              <div className="hero-banner-specular pointer-events-none absolute inset-0" />
              <div className="hero-banner-color-bloom pointer-events-none absolute inset-0" />

              <div className="hero-banner-content relative flex min-h-[460px] flex-col justify-end p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap" data-testid="hero-banner-bottom-primary-buttons">
                  <Button asChild size="lg" className="btn-neon-rainbow min-h-[50px] rounded-full px-8 text-sm font-semibold text-white" data-testid="home-hero-primary-cta-button">
                    <Link to={heroPrimary.to}>
                      <span key={`hero-primary-${heroPrimary.to}-${rotationIndex}`} className="inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                        {heroPrimary.label}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                  <Button asChild variant="glass" size="lg" className={secondaryButton} data-testid="home-hero-secondary-cta-button">
                    <Link to={heroSecondary.to}>
                      <span key={`hero-secondary-${heroSecondary.to}-${rotationIndex}`} className="inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                        {heroSecondary.label}
                        <Compass className="h-4 w-4 neon-rgb-icon" />
                      </span>
                    </Link>
                  </Button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3" data-testid="home-hero-highlights-grid">
                  {[heroPrimary, heroSecondary, heroNews].map((item, index) => (
                    <Card key={`hero-highlight-${index}-${item.to}`} className="rounded-[1.5rem] border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]" data-testid={`home-hero-highlight-${index + 1}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center h-9 rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_0_18px_rgba(255,255,255,0.06)] text-sm font-semibold text-white neon-rgb-text-soft">
                          <span key={`hero-highlight-label-${index}-${item.to}-${rotationIndex}`} className="animate-in fade-in zoom-in-95 duration-500">
                            {item.label}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-quick-portal-section">
          <div className={`${luxurySection} p-5 sm:p-7 lg:p-10`}>
            <div className={luxuryGlowLeft} />
            <div className={luxuryGlowRight} />
            <div className="relative">
              <div className="mb-8 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">Portails</p>
                <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl neon-rgb-text-soft" data-testid="home-quick-portal-heading">Accès principaux</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {portalEntries.map((card, index) => {
                  const Icon = card.action.icon;
                  return (
                    <Link key={`${card.testId}-${card.action.to}-${rotationIndex}`} to={card.action.to} className="group block" data-testid={card.testId}>
                      <Card className={`${luxuryCard} rgb-neon`}>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
                        <div className="grid gap-0 sm:grid-cols-[1.02fr_0.98fr]">
                          <CardContent className="relative flex flex-col justify-between p-6">
                            <div className="space-y-4">
                              <div className={luxuryIcon}>
                                <Icon className="h-5 w-5 neon-rgb-icon" />
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-white/46">{card.subtitle}</p>
                                <h3 className="mt-2 font-display text-2xl font-black text-white neon-rgb-text-soft">
                                  <span key={`portal-card-${index}-${card.action.to}-${rotationIndex}`} className="animate-in fade-in zoom-in-95 duration-500">{card.action.label}</span>
                                </h3>
                              </div>
                            </div>
                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/92">
                              Ouvrir
                              <ArrowRight className="h-4 w-4 neon-rgb-icon transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                          </CardContent>
                          <div className="relative min-h-[220px] overflow-hidden sm:min-h-[250px]">
                            <img src={card.image} alt={card.action.label} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-black/72" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-platforms-section">
          <div className={`${luxurySection} p-5 sm:p-7 lg:p-10`}>
            <div className={luxuryGlowLeft} />
            <div className={luxuryGlowRight} />
            <div className="relative">
              <div className="relative mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="h-12 w-48 rounded-[1.25rem] border border-white/10 bg-white/[0.04] shadow-[0_0_24px_rgba(34,211,238,0.1)]" data-testid="home-platforms-heading-placeholder" />
                <Button asChild variant="glass" className={secondaryButton} data-testid="home-platforms-button">
                  <Link to={heroSecondary.to}>
                    <span key={`platform-cta-${heroSecondary.to}-${rotationIndex}`} className="inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                      {heroSecondary.label}
                      <ArrowRight className="h-4 w-4 neon-rgb-icon" />
                    </span>
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {platformEntries.map((card, index) => {
                  const Icon = card.action.icon;
                  return (
                    <Link key={`${card.testId}-${card.action.to}-${rotationIndex}`} to={card.action.to} className="group block" data-testid={card.testId}>
                      <Card className={`${luxuryCard} h-full`}>
                        <CardContent className="space-y-4 p-6">
                          <div className={luxuryIcon}>
                            <Icon className="h-5 w-5 neon-rgb-icon" />
                          </div>
                          <p className="text-xl font-semibold text-white neon-rgb-text-soft">
                            <span key={`platform-card-${index}-${card.action.to}-${rotationIndex}`} className="animate-in fade-in zoom-in-95 duration-500">{card.action.label}</span>
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="rgb-neon relative mt-6 overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.05]" data-testid="home-platforms-zone-video-player">
                <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/44 via-transparent to-black/8" />
                <div className="pointer-events-none absolute inset-0 z-[1] opacity-22 mix-blend-screen bg-[linear-gradient(110deg,transparent_16%,rgba(255,255,255,0.2)_28%,transparent_42%,transparent_64%,rgba(255,255,255,0.16)_74%,transparent_88%)] animate-[shimmer_9s_linear_infinite]" />
                <div className="pointer-events-none absolute inset-0 z-[1] opacity-18 bg-[radial-gradient(circle_at_18%_30%,rgba(255,120,220,0.16),transparent_26%),radial-gradient(circle_at_82%_28%,rgba(34,211,238,0.15),transparent_24%)] animate-pulse-glow" />
                <video
                  className="mobile-safe-video w-full object-cover"
                  src={portalButtonsZoneVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  data-testid="home-platforms-zone-video"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-featured-videos-section">
          <div className={`${luxurySection} p-5 sm:p-7 lg:p-10`}>
            <div className={luxuryGlowLeft} />
            <div className={luxuryGlowRight} />
            <div className="relative">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-white/60">À regarder</p>
                  <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl neon-rgb-text-soft" data-testid="home-featured-videos-heading">Vidéos</h2>
                </div>
                <Button asChild className="btn-neon-rainbow rounded-full text-white" data-testid="home-featured-videos-youtube-button">
                  <Link to={featuredVideoAction.to}>
                    <span key={`video-action-${featuredVideoAction.to}-${rotationIndex}`} className="inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                      {featuredVideoAction.label}
                      <Youtube className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </div>
              <div className="rgb-neon rounded-[1.9rem] border border-white/15 bg-white/[0.05] p-4 sm:p-5" data-testid="home-featured-videos-carousel">
                <RecentEpisodesCarousel />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-news-preview-section">
          <div className={`${luxurySection} p-5 sm:p-7 lg:p-10`}>
            <div className={luxuryGlowLeft} />
            <div className={luxuryGlowRight} />
            <div className="relative">
              <div className="relative mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="h-12 w-44 rounded-[1.25rem] border border-white/10 bg-white/[0.04] shadow-[0_0_24px_rgba(232,121,249,0.1)]" data-testid="home-news-preview-heading-placeholder" />
                <Button asChild variant="glass" className={secondaryButton} data-testid="home-news-preview-button">
                  <Link to={newsAction.to}>
                    <span key={`news-action-${newsAction.to}-${rotationIndex}`} className="inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                      {newsAction.label}
                      <ArrowRight className="h-4 w-4 neon-rgb-icon" />
                    </span>
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {featuredNews.map((item) => (
                  <Link key={item.id} to={item.href} className="group block" data-testid={item.testId}>
                    <Card className={`${luxuryCard} h-full`}>
                      <div className="relative aspect-[16/10] overflow-hidden bg-black/20">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/18 to-transparent" />
                        <div className="absolute left-4 top-4">
                          <Badge className="rounded-full border border-white/20 bg-white/[0.08] text-white/90 backdrop-blur-xl">{item.category}</Badge>
                        </div>
                      </div>
                      <CardContent className="space-y-2 p-5">
                        <h3 className="line-clamp-2 text-xl font-semibold text-white neon-rgb-text-soft">{item.title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
