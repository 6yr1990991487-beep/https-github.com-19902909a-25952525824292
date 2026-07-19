import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Compass, Film, Newspaper, Play, ShoppingBag, Star, Youtube } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { RecentEpisodesCarousel } from "@/components/RecentEpisodesCarousel";
import { ProductArtwork } from "@/components/ProductArtwork";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEO_NEWS } from "@/data/seoNews";
import { SHOP_PRODUCTS } from "@/data/shopProducts";
import heroImage from "@/assets/anime-moments-hero.jpg";
import mangaBanner from "@/assets/manga-banner.jpg";

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

const featuredProducts = SHOP_PRODUCTS.slice(0, 4);

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

const getPortalDestination = (slotIndex, rotationIndex) =>
  rotatingPortalDestinations[(slotIndex + rotationIndex) % rotatingPortalDestinations.length];

export default function RootLandingPage() {
  const [rotationIndex, setRotationIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRotationIndex((value) => (value + 1) % rotatingPortalDestinations.length);
    }, portalRotationIntervalMs);
    return () => window.clearInterval(id);
  }, []);

  const heroPrimary = useMemo(() => getPortalDestination(0, rotationIndex), [rotationIndex]);
  const heroSecondary = useMemo(() => getPortalDestination(1, rotationIndex), [rotationIndex]);
  const heroNews = useMemo(() => getPortalDestination(2, rotationIndex), [rotationIndex]);
  const heroShop = useMemo(() => getPortalDestination(3, rotationIndex), [rotationIndex]);
  const portalEntries = useMemo(() => portalCards.map((card, index) => ({ ...card, action: getPortalDestination(index, rotationIndex) })), [rotationIndex]);
  const platformEntries = useMemo(() => platformCards.map((card, index) => ({ ...card, action: getPortalDestination(index + 4, rotationIndex) })), [rotationIndex]);
  const featuredVideoAction = useMemo(() => getPortalDestination(5, rotationIndex), [rotationIndex]);
  const newsAction = useMemo(() => getPortalDestination(6, rotationIndex), [rotationIndex]);
  const finalPrimary = useMemo(() => getPortalDestination(7, rotationIndex), [rotationIndex]);
  const finalSecondary = useMemo(() => getPortalDestination(8, rotationIndex), [rotationIndex]);

  return (
    <PageShell>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(pageStructuredData)}</script>
      </Helmet>

      <div className="relative overflow-hidden" data-testid="root-landing-page">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_20%)]" />

        <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-18 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className={`${luxurySection} p-6 sm:p-8 lg:p-10`}>
            <div className={luxuryGlowLeft} />
            <div className={luxuryGlowRight} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,transparent_65%,rgba(255,255,255,0.03))]" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-6" data-testid="root-landing-hero-content">
                <div className="space-y-4">
                  <div className="h-3 w-28 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-xl" data-testid="home-hero-badge-placeholder" />
                  <div className="flex flex-col gap-3" data-testid="home-hero-title-placeholder">
                    <div className="h-16 max-w-[22rem] rounded-[1.25rem] border border-white/10 bg-white/[0.04] shadow-[0_0_28px_rgba(232,121,249,0.12)] sm:h-20" />
                    <div className="h-16 max-w-[18rem] rounded-[1.25rem] border border-white/10 bg-white/[0.04] shadow-[0_0_28px_rgba(34,211,238,0.12)] sm:h-20" />
                    <div className="h-16 max-w-[20rem] rounded-[1.25rem] border border-white/10 bg-white/[0.04] shadow-[0_0_28px_rgba(232,121,249,0.12)] sm:h-20" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

                <div className="grid gap-3 sm:grid-cols-3" data-testid="home-hero-highlights-grid">
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

              <div className="grid gap-4" data-testid="root-landing-hero-visual">
                <Card className="rgb-neon overflow-hidden rounded-[2rem] border-white/15 bg-white/[0.05] shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <img src={heroImage} alt="Univers anime Lovanet" className="h-full w-full object-cover" data-testid="home-hero-image" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/14 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.08] p-4 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/58">Portail</p>
                        <p className="mt-2 text-2xl font-semibold text-white neon-rgb-text-soft" data-testid="home-hero-visual-title">
                          Entrer
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="rgb-neon overflow-hidden rounded-[1.5rem] border-white/15 bg-white/[0.05]">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={mangaBanner} alt="Décor manga futuriste" className="h-full w-full object-cover" data-testid="home-hero-secondary-image" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/72 to-transparent" />
                    </div>
                  </Card>
                  <Card className="rounded-[1.5rem] border border-white/15 bg-white/[0.07] backdrop-blur-2xl" data-testid="home-hero-aside-card">
                    <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-white/58">Accès direct</p>
                      <Link to={heroNews.to} className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.12]" data-testid="home-hero-link-news">
                        <span key={`hero-news-${heroNews.to}-${rotationIndex}`} className="neon-rgb-text-soft animate-in fade-in zoom-in-95 duration-500">{heroNews.label}</span>
                        <ArrowRight className="h-4 w-4 neon-rgb-icon" />
                      </Link>
                      <Link to={heroShop.to} className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.12]" data-testid="home-hero-link-shop">
                        <span key={`hero-shop-${heroShop.to}-${rotationIndex}`} className="neon-rgb-text-soft animate-in fade-in zoom-in-95 duration-500">{heroShop.label}</span>
                        <ArrowRight className="h-4 w-4 neon-rgb-icon" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-quick-portal-section">
          <div className={`${luxurySection} p-6 sm:p-8 lg:p-10`}>
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
                          <div className="relative min-h-[250px] overflow-hidden">
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
          <div className={`${luxurySection} p-6 sm:p-8 lg:p-10`}>
            <div className={luxuryGlowLeft} />
            <div className={luxuryGlowRight} />
            <div className="relative">
              <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-featured-videos-section">
          <div className={`${luxurySection} p-6 sm:p-8 lg:p-10`}>
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
          <div className={`${luxurySection} p-6 sm:p-8 lg:p-10`}>
            <div className={luxuryGlowLeft} />
            <div className={luxuryGlowRight} />
            <div className="relative">
              <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
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

        <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24" data-testid="home-final-cta-section">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className={`${luxurySection} overflow-hidden`}>
              <CardContent className="relative space-y-5 p-6 sm:p-8 lg:p-10">
                <div className={luxuryGlowLeft} />
                <div className={luxuryGlowRight} />
                <div className="relative space-y-5">
                  <div className="h-3 w-28 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-xl" data-testid="home-final-cta-badge-placeholder" />
                  <div className="h-12 w-60 rounded-[1.25rem] border border-white/10 bg-white/[0.04] shadow-[0_0_24px_rgba(232,121,249,0.1)]" data-testid="home-final-cta-heading-placeholder" />
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild size="lg" className="btn-neon-rainbow rounded-full text-white" data-testid="home-final-cta-primary-button">
                      <Link to={finalPrimary.to}>
                        <span key={`final-primary-${finalPrimary.to}-${rotationIndex}`} className="inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                          {finalPrimary.label}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </Button>
                    <Button asChild variant="glass" size="lg" className={secondaryButton} data-testid="home-final-cta-secondary-button">
                      <Link to={finalSecondary.to}>
                        <span key={`final-secondary-${finalSecondary.to}-${rotationIndex}`} className="inline-flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                          {finalSecondary.label}
                          <ArrowRight className="h-4 w-4 neon-rgb-icon" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2" data-testid="home-product-preview-grid">
              {featuredProducts.map((product, index) => (
                <Link key={product.id} to="/shop" className="group block" data-testid={`home-product-preview-card-${index + 1}`}>
                  <Card className={`${luxuryCard} h-full rgb-neon`}>
                    <div className="aspect-square overflow-hidden bg-black/20">
                      <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                        <ProductArtwork seed={product.id} category={product.category} label={product.name} />
                      </div>
                    </div>
                    <CardContent className="space-y-2 p-4">
                      <p className="line-clamp-2 text-sm font-semibold text-white neon-rgb-text-soft">{product.name}</p>
                      <p className="text-sm font-black text-white neon-rgb-text-mini">{product.price} €</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
