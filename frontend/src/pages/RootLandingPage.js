import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Compass, Film, Newspaper, Play, ShoppingBag, Star, Youtube } from "lucide-react";
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

const portalCards = [
  {
    to: "/anime-moments",
    title: "Anime Moments",
    subtitle: "Page immersive",
    description: "La porte d’entrée visuelle vers les vidéos, l’énergie néon et l’univers original du site.",
    image: heroImage,
    icon: Film,
    testId: "home-portal-anime-moments-card",
  },
  {
    to: "/decouvrir",
    title: "Univers Lovanet",
    subtitle: "Hubs & exploration",
    description: "Décors, hubs 3D, univers connectés et accès rapide aux grandes zones du site.",
    image: mangaBanner,
    icon: Compass,
    testId: "home-portal-discover-card",
  },
  {
    to: "/actualites",
    title: "Actualités",
    subtitle: "News & nouveautés",
    description: "Retrouve les sorties, les annonces et les derniers contenus éditoriaux de l’univers anime.",
    image: heroImage,
    icon: Newspaper,
    testId: "home-portal-news-card",
  },
  {
    to: "/shop",
    title: "Boutique collector",
    subtitle: "Éditions & drops",
    description: "Une sélection d’objets, visuels et pièces collector reliés à l’univers Lovanet.",
    image: mangaBanner,
    icon: ShoppingBag,
    testId: "home-portal-shop-card",
  },
];

const platformCards = [
  {
    to: "/chaine-youtube",
    title: "YouTube officiel",
    description: "Extraits, épisodes, formats courts et capsules vidéo.",
    icon: Youtube,
    testId: "home-platform-youtube-card",
  },
  {
    to: "/tiktok",
    title: "TikTok",
    description: "Formats rapides, verticalité et découvertes instantanées.",
    icon: Play,
    testId: "home-platform-tiktok-card",
  },
  {
    to: "/prime-video",
    title: "Prime Vidéo",
    description: "Accès aux univers plus longs et aux inspirations streaming.",
    icon: Play,
    testId: "home-platform-prime-card",
  },
  {
    to: "/anime-catalog",
    title: "Catalogue anime",
    description: "Explorer les références, les œuvres et les séries à suivre.",
    icon: Star,
    testId: "home-platform-catalog-card",
  },
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

export default function RootLandingPage() {
  return (
    <PageShell>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(pageStructuredData)}</script>
      </Helmet>

      <div className="relative overflow-hidden" data-testid="root-landing-page">
        <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-18 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8">
            <div className="space-y-6" data-testid="root-landing-hero-content">
              <Badge
                variant="outline"
                className="border-cyan-300/20 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100"
                data-testid="home-hero-badge"
              >
                Lovanet · portail anime manga
              </Badge>

              <div className="space-y-4">
                <h1
                  className="max-w-3xl font-display text-4xl font-black leading-[0.95] text-white sm:text-5xl lg:text-6xl"
                  data-testid="home-hero-heading"
                >
                  Le portail premium pour entrer dans les univers anime, les vidéos et les collectors.
                </h1>
                <p
                  className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base"
                  data-testid="home-hero-description"
                >
                  Découvre les pages principales du site, les contenus en vedette et les accès rapides vers les sections les plus visitées de l’univers Lovanet.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="btn-neon-rainbow min-h-[48px] rounded-full px-7 text-sm font-semibold text-white"
                  data-testid="home-hero-primary-cta-button"
                >
                  <Link to="/anime-moments">
                    Entrer dans Anime Moments
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="glass"
                  size="lg"
                  className="min-h-[48px] rounded-full border-white/20 bg-white/[0.04] px-7 text-white hover:bg-white/[0.08]"
                  data-testid="home-hero-secondary-cta-button"
                >
                  <Link to="/decouvrir">
                    Explorer l’univers Lovanet
                    <Compass className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3" data-testid="home-hero-highlights-grid">
                {[
                  { label: "Anime Moments", value: "Immersif", testId: "home-hero-highlight-1" },
                  { label: "Contenus", value: "Vidéos & news", testId: "home-hero-highlight-2" },
                  { label: "Boutique", value: "Collectors", testId: "home-hero-highlight-3" },
                ].map((item) => (
                  <Card key={item.testId} className="border-white/10 bg-white/[0.04]" data-testid={item.testId}>
                    <CardContent className="space-y-2 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{item.label}</p>
                      <p className="text-lg font-semibold text-white">{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid gap-4" data-testid="root-landing-hero-visual">
              <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.04] shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={heroImage}
                    alt="Univers anime Lovanet"
                    className="h-full w-full object-cover"
                    data-testid="home-hero-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/80">Mise en avant</p>
                      <p className="mt-2 text-xl font-semibold text-white" data-testid="home-hero-visual-title">
                        Une page portail pensée pour voir, choisir et entrer.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="overflow-hidden rounded-[1.5rem] border-white/10 bg-white/[0.04]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={mangaBanner} alt="Décor manga futuriste" className="h-full w-full object-cover" data-testid="home-hero-secondary-image" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                </Card>
                <Card className="rounded-[1.5rem] border-white/10 bg-white/[0.04]" data-testid="home-hero-aside-card">
                  <CardContent className="flex h-full flex-col justify-center gap-4 p-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-100/75">Accès direct</p>
                    <div className="space-y-3">
                      <Link to="/actualites" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]" data-testid="home-hero-link-news">
                        Actualités
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link to="/shop" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]" data-testid="home-hero-link-shop">
                        Boutique
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-quick-portal-section">
          <div className="mb-8 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">Portails</p>
            <h2 className="font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-quick-portal-heading">
              Les grandes entrées du site, réunies sur une seule page.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {portalCards.map((card) => (
              <Link key={card.to} to={card.to} className="group" data-testid={card.testId}>
                <Card className="overflow-hidden rounded-[1.75rem] border-white/10 bg-white/[0.04] transition-[transform,border-color,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:border-cyan-200/20">
                  <div className="grid gap-0 sm:grid-cols-[1.05fr_0.95fr]">
                    <CardContent className="flex flex-col justify-between p-6">
                      <div className="space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-cyan-100">
                          <card.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">{card.subtitle}</p>
                          <h3 className="mt-2 font-display text-2xl font-black text-white">{card.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-white/62">{card.description}</p>
                        </div>
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        Ouvrir
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                    <div className="relative min-h-[240px] overflow-hidden">
                      <img src={card.image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-l from-black/18 to-black/62" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-platforms-section">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/70">Accès rapides</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-platforms-heading">
                Vidéos, streaming, catalogue et actualités.
              </h2>
            </div>
            <Button asChild variant="glass" className="rounded-full border-white/20 bg-white/[0.04] text-white" data-testid="home-platforms-button">
              <Link to="/lecteurs-video">
                Voir les lecteurs vidéo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {platformCards.map((card) => (
              <Link key={card.to} to={card.to} className="group" data-testid={card.testId}>
                <Card className="h-full rounded-[1.5rem] border-white/10 bg-white/[0.04] transition-[transform,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-fuchsia-200/20">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-cyan-100">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white">{card.title}</p>
                      <p className="mt-3 text-sm leading-7 text-white/62">{card.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-featured-videos-section">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">À regarder</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-featured-videos-heading">
                Les vidéos mises en avant sur le portail.
              </h2>
            </div>
            <Button asChild className="btn-neon-rainbow rounded-full text-white" data-testid="home-featured-videos-youtube-button">
              <Link to="/chaine-youtube">
                Ouvrir YouTube
                <Youtube className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5" data-testid="home-featured-videos-carousel">
            <RecentEpisodesCarousel />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24" data-testid="home-news-preview-section">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/70">À la une</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-news-preview-heading">
                Une sélection d’actualités et de contenus en vedette.
              </h2>
            </div>
            <Button asChild variant="glass" className="rounded-full border-white/20 bg-white/[0.04] text-white" data-testid="home-news-preview-button">
              <Link to="/actualites">
                Toutes les actualités
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredNews.map((item) => (
              <Link key={item.id} to={item.href} className="group" data-testid={item.testId}>
                <Card className="h-full overflow-hidden rounded-[1.5rem] border-white/10 bg-white/[0.04] transition-[transform,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-cyan-200/20">
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/20">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute left-4 top-4">
                      <Badge className="border-0 bg-black/45 text-white">{item.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="space-y-3 p-5">
                    <h3 className="line-clamp-2 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="line-clamp-3 text-sm leading-7 text-white/62">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24" data-testid="home-final-cta-section">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.05] shadow-[0_30px_90px_-44px_rgba(0,0,0,0.95)]">
              <CardContent className="space-y-5 p-6 sm:p-8 lg:p-10">
                <Badge variant="outline" className="border-white/15 bg-white/[0.05] text-white/85" data-testid="home-final-cta-badge">
                  Boutique collector
                </Badge>
                <h2 className="font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-final-cta-heading">
                  Prévisualisation produits et accès direct vers la boutique.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-white/62" data-testid="home-final-cta-description">
                  Une sélection visible dès l’entrée pour découvrir les pièces mises en avant du moment.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button asChild size="lg" className="btn-neon-rainbow rounded-full text-white" data-testid="home-final-cta-primary-button">
                    <Link to="/shop">
                      Ouvrir la boutique
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="glass" size="lg" className="rounded-full border-white/20 bg-white/[0.04] text-white" data-testid="home-final-cta-secondary-button">
                    <Link to="/actualites">
                      Voir les nouveautés
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2" data-testid="home-product-preview-grid">
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to="/shop"
                  className="group"
                  data-testid={`home-product-preview-card-${index + 1}`}
                >
                  <Card className="h-full overflow-hidden rounded-[1.4rem] border-white/10 bg-white/[0.04] transition-[transform,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-cyan-200/20">
                    <div className="aspect-square overflow-hidden bg-black/20">
                      <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                        <ProductArtwork seed={product.id} category={product.category} label={product.name} />
                      </div>
                    </div>
                    <CardContent className="space-y-2 p-4">
                      <p className="line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
                      <p className="text-xs leading-6 text-white/62">{product.tag}</p>
                      <p className="text-sm font-black text-cyan-100">{product.price} €</p>
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
