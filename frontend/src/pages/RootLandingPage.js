import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Compass, Film, Newspaper, Play, ShoppingBag, Star, Youtube } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SEO_NEWS } from "@/data/seoNews";
import { videos as SITE_VIDEOS, thumb as videoThumb } from "@/data/videos";
import { PageShell } from "@/components/PageShell";
import { RecentEpisodesCarousel } from "@/components/RecentEpisodesCarousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  {
    title: "Boutique immersive",
    subtitle: "Sélection collector",
    description: "Sélection produits, drops et pièces collector mises à jour en continu.",
    image: heroImage,
    video: portalButtonsZoneVideo,
    testId: "home-portal-card-1",
    to: "/shop",
  },
  {
    title: "Prime & vidéos",
    subtitle: "Expérience premium",
    description: "Lecture premium, extraits et navigation multi-plateforme.",
    image: mangaBanner,
    video: portalZoneReplacement,
    testId: "home-portal-card-2",
    to: "/prime-video",
  },
];

const platformCards = [
  { title: "YouTube", testId: "home-platform-card-youtube", to: "/chaine-youtube" },
  { title: "Prime Vidéo", testId: "home-platform-card-prime", to: "/prime-video" },
  { title: "TikTok", testId: "home-platform-card-tiktok", to: "/tiktok" },
  { title: "Catalogue", testId: "home-platform-card-catalogue", to: "/anime-catalog" },
];


const shuffleArray = (list) => {
  const clone = [...list];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

const normalizeLowerBannerItem = (item, index, kind = "actualité") => ({
  id: item.id || `${kind}-${index}`,
  title: item.title || item.name || `Contenu ${index + 1}`,
  eyebrow: item.eyebrow || kind,
  image: item.image || item.cover || item.banner || "/lovanet-og.svg",
  description: item.description || item.excerpt || item.synopsis || item.summary || item.genres?.slice?.(0, 3)?.join(" • ") || `${kind} premium`,
  previewVideo: item.previewVideo || null,
  href: item.href || item.url || item.sourcePath || (kind === "catalogue" ? "/anime-catalog" : "/actualites"),
});

const buildLowerBannerCandidates = (route, catalogItems) => {
  const normalizedCatalog = (catalogItems || []).map((item, index) =>
    normalizeLowerBannerItem(
      {
        id: `catalog-${item.id || index}`,
        title: item.title,
        image: item.cover || item.banner,
        description: item.genres?.slice?.(0, 3)?.join(" • ") || item.type || "catalogue",
        href: "/anime-catalog",
        eyebrow: "catalogue",
      },
      index,
      "catalogue",
    ),
  );

  const normalizedNews = SEO_NEWS.filter((item) => item.category === "news").map((item, index) =>
    normalizeLowerBannerItem({
      id: `news-${item.id || index}`,
      title: item.title,
      image: item.image,
      description: item.description || item.excerpt,
      href: "/actualites",
      eyebrow: "actualité",
    }, index, "actualité"),
  );

  const normalizedVideos = SITE_VIDEOS.map((item, index) =>
    normalizeLowerBannerItem({
      id: `site-video-${item.id}`,
      title: item.title,
      image: videoThumb(item.id),
      description: `${item.series || "AnimeOfficial"}${item.episode ? ` • ${item.episode}` : ""}`,
      href: `/lecteurs-video?video=${item.id}&service=youtube`,
      eyebrow: "vidéo",
    }, index, "vidéo"),
  );

  if (route === "/actualites") return normalizedNews;
  if (route === "/anime-catalog") return normalizedCatalog;
  if (route === "/chaine-youtube") return normalizedVideos;
  if (route === "/prime-video") return normalizedVideos;
  if (route === "/tiktok") return normalizedVideos;
  if (route === "/lecteurs-video") return normalizedVideos;
  if (route === "/anime-countdown") return normalizedCatalog;
  if (route === "/anime-moments") return [...normalizedCatalog, ...normalizedVideos];
  if (route === "/decouvrir") return [...normalizedCatalog, ...normalizedNews, ...normalizedVideos];
  return [...normalizedCatalog, ...normalizedNews, ...normalizedVideos];
};

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
  const [catalogBannerItems, setCatalogBannerItems] = useState([]);
  const [premiumBannerCards, setPremiumBannerCards] = useState([]);
  const bannerQueuesRef = useRef({});
  const bannerVideoRef = useRef(null);
  const bannerShellRef = useRef(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRotationIndex((value) => (value + 1) % rotatingPortalDestinations.length);
    }, portalRotationIntervalMs);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/catalog-seo.json")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setCatalogBannerItems(data);
        }
      })
      .catch(() => {
        if (!cancelled) setCatalogBannerItems([]);
      });
    return () => {
      cancelled = true;
    };
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
  const premiumBannerRows = useMemo(() => Array.from({ length: 4 }, (_, rowIndex) => premiumBannerCards.slice(rowIndex * 5, rowIndex * 5 + 5)), [premiumBannerCards]);

  useEffect(() => {
    const key = heroSecondary.to;
    const pool = buildLowerBannerCandidates(key, catalogBannerItems);
    if (!pool.length) {
      setPremiumBannerCards([]);
      return undefined;
    }

    const existing = bannerQueuesRef.current[key];
    const queue = existing?.length ? existing : shuffleArray(pool);
    bannerQueuesRef.current[key] = queue;
    setPremiumBannerCards(queue.slice(0, 20));
    bannerQueuesRef.current[key] = queue.slice(20).length ? queue.slice(20) : shuffleArray(pool);
    return undefined;
  }, [heroSecondary.to, catalogBannerItems]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      const key = heroSecondary.to;
      const pool = buildLowerBannerCandidates(key, catalogBannerItems);
      if (!pool.length) return;
      let queue = bannerQueuesRef.current[key];
      if (!queue || !queue.length) queue = shuffleArray(pool);
      const nextBatch = queue.slice(0, 20);
      let rest = queue.slice(20);
      if (!rest.length) rest = shuffleArray(pool);
      bannerQueuesRef.current[key] = rest;
      setPremiumBannerCards(nextBatch);
    }, 20000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, heroSecondary.to, catalogBannerItems]);

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
                className="hero-banner-video absolute inset-0 h-full w-full object-contain object-center"
                style={{ "--banner-video-scale": activeBannerVideoIndex === 0 ? 1.12 : 0.65 }}
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
                        <Link to={item.to} className="flex items-center justify-center h-9 rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_0_18px_rgba(255,255,255,0.06)] text-sm font-semibold text-white neon-rgb-text-soft" data-testid={`home-hero-highlight-link-${index + 1}`}>
                          <span key={`hero-highlight-label-${index}-${item.to}-${rotationIndex}`} className="animate-in fade-in zoom-in-95 duration-500">
                            {item.label}
                          </span>
                        </Link>
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
              <div className="relative">
                {portalEntries.map((card, index) => {
                  const Icon = card.action.icon;
                  return (
                    <Link key={`${card.testId}-${card.action.to}-${rotationIndex}`} to={card.action.to} className="group block" data-testid={card.testId}>
                      <Card className={`${luxuryCard} portal-card-neutral-shell`}>
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]" />
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
                          <div className="relative min-h-[220px] overflow-hidden sm:min-h-[250px]" data-testid={`${card.testId}-preview-video-shell`}>
                            <video
                              className="portal-card-neutral-video h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              src={card.video}
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              data-testid={`${card.testId}-preview-video`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-black/18 via-black/24 to-black/54" />
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
          <div className={`${luxurySection} home-platforms-neutral-shell p-5 sm:p-7 lg:p-10`}>
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(6,14,26,0.9),rgba(6,14,26,0.94))]" />
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
              <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="home-platforms-pill-row">
                {platformEntries.map((card, index) => {
                  const Icon = card.action.icon;
                  return (
                    <Link key={`${card.testId}-${card.action.to}-${rotationIndex}`} to={card.action.to} className="group block min-w-0" data-testid={card.testId}>
                      <Card className={`${luxuryCard} h-full`}>
                        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                          <div className={`${luxuryIcon} h-10 w-10 shrink-0 sm:h-11 sm:w-11`}>
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 neon-rgb-icon" />
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-white neon-rgb-text-soft">
                            <span key={`platform-card-${index}-${card.action.to}-${rotationIndex}`} className="animate-in fade-in zoom-in-95 duration-500">{card.action.label}</span>
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="hero-premium-lower-marquee mt-6" data-testid="home-platforms-dynamic-banner-grid">
                {premiumBannerRows.map((row, rowIndex) => (
                  <div key={`premium-row-${rowIndex}`} className="hero-premium-lower-row">
                    <div className={`hero-premium-lower-track ${rowIndex % 2 === 1 ? "hero-premium-lower-track-reverse" : ""}`}>
                      {[...row, ...row].map((item, index) => (
                        <Link
                          key={`${item.id}-${rowIndex}-${index}`}
                          to={item.href}
                          className="hero-premium-lower-card group flex w-[132px] min-w-[132px] max-w-[132px] flex-none flex-col sm:w-[148px] sm:min-w-[148px] sm:max-w-[148px] lg:w-[176px] lg:min-w-[176px] lg:max-w-[176px] xl:w-[196px] xl:min-w-[196px] xl:max-w-[196px]"
                          data-testid={`home-platforms-dynamic-card-${rowIndex + 1}-${index + 1}`}
                        >
                          <div className="hero-premium-lower-thumb-shell hero-premium-lower-thumb-shell-vertical aspect-[3/4] w-full">
                            <img src={item.image} alt={item.title} className="hero-premium-lower-thumb" loading="lazy" />
                            <div className="hero-premium-lower-thumb-overlay" />
                            <div className="hero-premium-lower-badge">{item.eyebrow}</div>
                          </div>
                          <div className="hero-premium-lower-copy">
                            <p className="hero-premium-lower-title">{item.title}</p>
                            <p className="hero-premium-lower-description">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
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
