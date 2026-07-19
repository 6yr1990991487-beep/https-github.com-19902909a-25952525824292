import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Film,
  Music2,
  Newspaper,
  Play,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Youtube,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { RecentEpisodesCarousel } from "@/components/RecentEpisodesCarousel";
import { ProductArtwork } from "@/components/ProductArtwork";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SHOP_PRODUCTS } from "@/data/shopProducts";
import heroImage from "@/assets/anime-moments-hero.jpg";
import mangaBanner from "@/assets/manga-banner.jpg";

const portalCards = [
  {
    to: "/anime-moments",
    title: "Anime Moments",
    subtitle: "Expérience originale",
    description:
      "Retrouve la page immersive historique avec hologrammes, carrousel vivant et ambiance néon.",
    image: heroImage,
    icon: Film,
    testId: "home-portal-anime-moments-card",
    size: "large",
  },
  {
    to: "/decouvrir",
    title: "Univers Lovanet",
    subtitle: "Explorer les mondes",
    description:
      "Parcours les hubs, les vidéos, les séries et les points d’entrée premium vers tout l’écosystème.",
    image: mangaBanner,
    icon: Compass,
    testId: "home-portal-discover-card",
    size: "small",
  },
  {
    to: "/shop",
    title: "Boutique collector",
    subtitle: "Drops et éditions limitées",
    description:
      "Affiches, vêtements et objets collector inspirés des univers manga et anime du projet.",
    image: heroImage,
    icon: ShoppingBag,
    testId: "home-portal-shop-card",
    size: "small",
  },
];

const chapterCards = [
  {
    number: "01",
    title: "Entrée dans le portail",
    text:
      "Une landing pensée comme une porte d’accès cinématique : identité forte, navigation claire et énergie futuriste maîtrisée.",
    icon: Sparkles,
    testId: "home-storyline-chapter-1",
  },
  {
    number: "02",
    title: "Connexion des plateformes",
    text:
      "YouTube, TikTok, Prime Video et catalogue anime sont réunis dans une expérience éditoriale cohérente et fluide.",
    icon: Youtube,
    testId: "home-storyline-chapter-2",
  },
  {
    number: "03",
    title: "Découverte, shopping, actualités",
    text:
      "Du visionnage à la collection, la plateforme relie contenus, produits, news et hubs 3D dans une même narration visuelle.",
    icon: Newspaper,
    testId: "home-storyline-chapter-3",
  },
];

const platformCards = [
  {
    to: "/chaine-youtube",
    title: "YouTube officiel",
    text: "Trailers, extraits, montages et capsules vidéo synchronisés autour de l’univers anime.",
    icon: Youtube,
    testId: "home-platform-youtube-card",
  },
  {
    to: "/tiktok",
    title: "TikTok",
    text: "Formats rapides, verticalité, reprises communautaires et accès direct au flux embarqué.",
    icon: Music2,
    testId: "home-platform-tiktok-card",
  },
  {
    to: "/prime-video",
    title: "Prime Vidéo",
    text: "Entrée immersive vers les lectures longues et les séances inspirées de l’expérience cinéma.",
    icon: Play,
    testId: "home-platform-prime-card",
  },
  {
    to: "/actualites",
    title: "Actualités",
    text: "Articles, nouveautés et signaux éditoriaux pour renforcer la découverte et le référencement du site.",
    icon: Newspaper,
    testId: "home-platform-news-card",
  },
];

const hubCards = [
  {
    to: "/decouvrir",
    title: "Hub Ferry",
    text: "Une escale atmosphérique intégrée dans l’univers Lovanet pour prolonger la visite dans un décor 3D narratif.",
    image: mangaBanner,
    icon: Compass,
    testId: "home-hub-ferry-card",
  },
  {
    to: "/shop",
    title: "Hub Train Station",
    text: "Une gare futuriste connectée à la boutique, pensée comme un point de passage vers les pièces collector.",
    image: heroImage,
    icon: ShoppingBag,
    testId: "home-hub-train-card",
  },
];

const stats = [
  {
    value: "1500+",
    label: "animés référencés",
    detail: "catalogue enrichi et teasers disponibles",
    testId: "home-stat-catalog",
  },
  {
    value: "Multi",
    label: "plateformes connectées",
    detail: "YouTube, TikTok, Prime Video et actualités",
    testId: "home-stat-platforms",
  },
  {
    value: "SEO+",
    label: "présence renforcée",
    detail: "sitemaps, métadonnées et JSON-LD avancés",
    testId: "home-stat-seo",
  },
  {
    value: "3D",
    label: "expériences immersives",
    detail: "hubs visuels et éléments holographiques",
    testId: "home-stat-hubs",
  },
];

const testimonials = [
  {
    title: "Navigation claire",
    text: "Chaque univers garde son identité tout en restant relié à une direction artistique unique.",
    testId: "home-proof-navigation",
  },
  {
    title: "Ambiance premium",
    text: "Le verre, la profondeur et les néons sont présents sans nuire à la lisibilité des contenus.",
    testId: "home-proof-premium",
  },
  {
    title: "Découverte continue",
    text: "La landing guide naturellement vers les vidéos, les hubs 3D, la boutique et les news.",
    testId: "home-proof-discovery",
  },
];

const faqItems = [
  {
    id: "faq-1",
    question: "Que trouve-t-on sur ce portail Lovanet ?",
    answer:
      "Cette page sert de point d’entrée principal vers Anime Moments, les vidéos, les actualités, l’univers Lovanet, le catalogue et la boutique collector.",
  },
  {
    id: "faq-2",
    question: "Les hubs 3D sont-ils toujours disponibles ?",
    answer:
      "Oui. Le Hub Ferry et le Hub Train Station restent accessibles depuis les pages Discover et Shop. Cette landing les présente comme des teasers sans alourdir les performances.",
  },
  {
    id: "faq-3",
    question: "Les contenus externes sont-ils synchronisés automatiquement ?",
    answer:
      "Le backend conserve la logique de synchronisation existante pour YouTube et les autres sources compatibles, avec des modes dégradés prévus pour les plateformes très restrictives.",
  },
  {
    id: "faq-4",
    question: "Pourquoi une page dédiée Anime Moments en sous-page ?",
    answer:
      "La page originale a été préservée dans /anime-moments pour garder son identité immersive, tandis que la racine devient une landing plus éditoriale et plus stratégique pour la navigation et le SEO.",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function RootLandingPage() {
  const primaryPortal = portalCards[0];

  return (
    <PageShell>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
      </Helmet>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-8rem] top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl animate-blob" />
          <div className="absolute right-[-6rem] top-20 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl animate-blob animation-delay-4000" />
        </div>

        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20 pb-14 sm:pb-18 lg:pb-24"
          data-testid="root-landing-page"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
            <div className="space-y-6" data-testid="root-landing-hero-content">
              <Badge
                variant="outline"
                className="border-cyan-300/30 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100 backdrop-blur"
                data-testid="home-hero-badge"
              >
                Portail Lovanet · manga futuriste
              </Badge>

              <div className="space-y-4">
                <h1
                  className="max-w-3xl font-display text-4xl font-black leading-[0.95] tracking-[0.02em] text-white sm:text-5xl lg:text-6xl"
                  data-testid="home-hero-heading"
                >
                  Une entrée néon vers l’univers anime, les hubs 3D et les collectors Lovanet.
                </h1>
                <p
                  className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base"
                  data-testid="home-hero-description"
                >
                  Cette nouvelle page racine rassemble l’essentiel : vidéos, découverte, actualités,
                  boutique et passerelles immersives. L’ancienne expérience originale reste disponible
                  dans une page dédiée, pensée comme un sanctuaire Anime Moments à part entière.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="btn-neon-rainbow min-h-[48px] rounded-full px-7 text-sm font-semibold text-white shadow-[0_18px_50px_-22px_hsl(var(--neon-cyan)/0.8)]"
                  data-testid="home-hero-primary-cta-button"
                >
                  <Link to="/anime-moments">
                    Explorer Anime Moments
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
                    Ouvrir l’univers Lovanet
                    <Compass className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3" data-testid="home-hero-highlights-grid">
                {[
                  {
                    title: "Navigation premium",
                    text: "Un point d’entrée clair vers chaque expérience du site.",
                    icon: ShieldCheck,
                    testId: "home-hero-highlight-navigation",
                  },
                  {
                    title: "Narration visuelle",
                    text: "Sections longues, lecture fluide et hiérarchie éditoriale.",
                    icon: BookOpen,
                    testId: "home-hero-highlight-story",
                  },
                  {
                    title: "Accès instantané",
                    text: "Vidéos, shop, actualités et hubs 3D en quelques clics.",
                    icon: Sparkles,
                    testId: "home-hero-highlight-access",
                  },
                ].map((item) => (
                  <Card
                    key={item.title}
                    className="glass-card border-white/10 bg-white/[0.04] shadow-[0_20px_50px_-28px_rgba(0,0,0,0.75)]"
                    data-testid={item.testId}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-cyan-100">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs leading-6 text-white/60">{item.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="relative" data-testid="root-landing-hero-visual">
              <div className="absolute -inset-6 rounded-[2rem] border border-cyan-300/10 bg-cyan-300/5 blur-3xl" />
              <Card className="rgb-card relative overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.04] shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={heroImage}
                    alt="Illustration immersive Lovanet"
                    className="h-full w-full object-cover"
                    data-testid="home-hero-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge className="border-0 bg-white/12 text-white" data-testid="home-hero-badge-sync">
                        Sync multi-plateformes
                      </Badge>
                      <Badge className="border-0 bg-white/12 text-white" data-testid="home-hero-badge-seo">
                        SEO enrichi
                      </Badge>
                      <Badge className="border-0 bg-white/12 text-white" data-testid="home-hero-badge-3d">
                        Hubs 3D
                      </Badge>
                    </div>
                    <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/80">
                            Capsule manifeste
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white" data-testid="home-hero-visual-title">
                            L’expérience anime, pensée comme un portail.
                          </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] text-white">
                          <Film className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-sm leading-6 text-white/65" data-testid="home-hero-visual-description">
                        Une interface éditoriale longue, premium et lisible qui mène vers la page Anime Moments,
                        l’univers Lovanet, les actualités et la boutique collector.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24"
          data-testid="home-quick-portal-section"
        >
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">Accès rapide</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-quick-portal-heading">
                Trois portails pour entrer au bon endroit.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/62" data-testid="home-quick-portal-description">
              Per design guidelines, cette section réutilise les surfaces verre et les accents néon cyan/magenta déjà présents dans le site pour assurer la continuité visuelle sans casser l’identité actuelle.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Link
              to={primaryPortal.to}
              className="group"
              data-testid={primaryPortal.testId}
            >
              <Card className="rgb-card overflow-hidden rounded-[1.75rem] border-white/10 bg-white/[0.04] shadow-[0_26px_70px_-36px_rgba(0,0,0,0.9)] transition-[transform,box-shadow,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-cyan-200/25">
                <div className="grid gap-0 md:grid-cols-[1fr_0.92fr]">
                  <CardHeader className="justify-between p-6 sm:p-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-cyan-100">
                          <Film className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="border-white/15 bg-white/[0.05] text-white/85">
                          {primaryPortal.subtitle}
                        </Badge>
                      </div>
                      <div>
                        <CardTitle className="font-display text-3xl font-black text-white">
                          {primaryPortal.title}
                        </CardTitle>
                        <CardDescription className="mt-3 max-w-md text-sm leading-7 text-white/62">
                          {primaryPortal.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="pt-6">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
                        Entrer dans la version immersive
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </CardHeader>
                  <div className="relative min-h-[260px] overflow-hidden md:min-h-full">
                    <img src={primaryPortal.image} alt="Anime Moments" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>
                </div>
              </Card>
            </Link>

            <div className="grid gap-4">
              {portalCards.slice(1).map((card) => (
                <Link key={card.to} to={card.to} className="group" data-testid={card.testId}>
                  <Card className="rgb-card overflow-hidden rounded-[1.5rem] border-white/10 bg-white/[0.04] transition-[transform,box-shadow,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-fuchsia-200/20">
                    <div className="grid grid-cols-[1.1fr_0.9fr] gap-0">
                      <CardContent className="flex flex-col justify-between p-5 sm:p-6">
                        <div className="space-y-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-white">
                            <card.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-white/55">{card.subtitle}</p>
                            <p className="mt-2 font-display text-2xl font-black text-white">{card.title}</p>
                            <p className="mt-2 text-sm leading-6 text-white/62">{card.description}</p>
                          </div>
                        </div>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-100">
                          Ouvrir maintenant
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </CardContent>
                      <div className="relative min-h-[200px] overflow-hidden">
                        <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-black/70" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24"
          data-testid="home-storyline-section"
        >
          <div className="mb-8 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/70">Storyline</p>
            <h2 className="font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-storyline-heading">
              Une progression en chapitres, pensée pour guider la découverte.
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {chapterCards.map((chapter) => (
              <Card
                key={chapter.number}
                className="glass-card rounded-[1.5rem] border-white/10 bg-white/[0.04] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.85)]"
                data-testid={chapter.testId}
              >
                <CardHeader className="space-y-5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-display text-5xl font-black text-white/16">{chapter.number}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-cyan-100">
                      <chapter.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl font-black text-white">{chapter.title}</CardTitle>
                    <CardDescription className="mt-3 text-sm leading-7 text-white/62">{chapter.text}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24"
          data-testid="home-platforms-section"
        >
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">Connexions</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-platforms-heading">
                Les passerelles principales de la plateforme.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/62" data-testid="home-platforms-description">
              Les sections vidéos, news et streaming sont regroupées ici pour accélérer l’accès aux contenus tout en gardant une cohérence éditoriale premium.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {platformCards.map((card) => (
              <Link key={card.to} to={card.to} className="group" data-testid={card.testId}>
                <Card className="glass-card h-full rounded-[1.5rem] border-white/10 bg-white/[0.04] transition-[transform,box-shadow,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-cyan-200/20">
                  <CardHeader className="space-y-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-cyan-100">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-white">{card.title}</CardTitle>
                      <CardDescription className="mt-3 text-sm leading-7 text-white/62">{card.text}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
                      Accéder à la section
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24"
          data-testid="home-featured-videos-section"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/70">Vidéos en vedette</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-featured-videos-heading">
                Des épisodes, extraits et capsules qui prolongent l’univers.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="glass" className="rounded-full border-white/20 bg-white/[0.04] text-white" data-testid="home-featured-videos-all-button">
                <Link to="/lecteurs-video">
                  Voir la lecture
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-cyan-300/30 bg-transparent text-cyan-100 hover:bg-cyan-300/10" data-testid="home-featured-videos-youtube-button">
                <Link to="/chaine-youtube">
                  Chaîne YouTube
                  <Youtube className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div data-testid="home-featured-videos-carousel" className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <RecentEpisodesCarousel />
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24"
          data-testid="home-hubs-teaser-section"
        >
          <div className="mb-8 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">Teaser 3D</p>
            <h2 className="font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-hubs-teaser-heading">
              Les hubs sont toujours là, prêts à prolonger l’immersion.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-white/62" data-testid="home-hubs-teaser-description">
              Selon les guidelines, cette landing se limite à un teaser visuel pour préserver les performances. Les expériences 3D complètes restent accessibles dans leurs pages dédiées.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {hubCards.map((hub) => (
              <Link key={hub.title} to={hub.to} className="group" data-testid={hub.testId}>
                <Card className="overflow-hidden rounded-[1.75rem] border-white/10 bg-white/[0.04] transition-[transform,box-shadow,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-fuchsia-200/20">
                  <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative min-h-[260px] overflow-hidden">
                      <img src={hub.image} alt={hub.title} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                    </div>
                    <CardContent className="flex flex-col justify-between p-6 sm:p-7">
                      <div className="space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-white">
                          <hub.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl font-black text-white" data-testid={`${hub.testId}-title`}>
                            {hub.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-white/62" data-testid={`${hub.testId}-description`}>
                            {hub.text}
                          </p>
                        </div>
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-100">
                        Découvrir le hub
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24"
          data-testid="home-community-proof-section"
        >
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/70">Preuves & repères</p>
              <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-community-proof-heading">
                Une base solide pour explorer, revoir et collectionner.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/62" data-testid="home-community-proof-description">
              La plateforme combine contenus éditoriaux, inventaire, synchronisation vidéo, design immersif et présence SEO renforcée.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <Card
                  key={stat.label}
                  className="glass-card rounded-[1.5rem] border-white/10 bg-white/[0.04]"
                  data-testid={stat.testId}
                >
                  <CardContent className="space-y-3 p-6">
                    <p className="font-display text-4xl font-black text-white">{stat.value}</p>
                    <div>
                      <p className="text-sm font-semibold text-white">{stat.label}</p>
                      <p className="mt-2 text-sm leading-7 text-white/62">{stat.detail}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4">
              {testimonials.map((item) => (
                <Card
                  key={item.title}
                  className="glass-card rounded-[1.5rem] border-white/10 bg-white/[0.04]"
                  data-testid={item.testId}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2 text-amber-300">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24"
          data-testid="home-faq-section"
        >
          <div className="mb-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">FAQ</p>
            <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-faq-heading">
              Les réponses essentielles avant d’entrer plus loin.
            </h2>
          </div>
          <Card className="glass-card rounded-[1.75rem] border-white/10 bg-white/[0.04]" data-testid="home-faq-accordion">
            <CardContent className="p-6 sm:p-8">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border-white/10">
                    <AccordionTrigger
                      className="text-left text-base font-semibold text-white hover:no-underline"
                      data-testid={`home-faq-trigger-${item.id}`}
                    >
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-7 text-white/62" data-testid={`home-faq-content-${item.id}`}>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pb-20 lg:pb-24"
          data-testid="home-final-cta-section"
        >
          <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.05] shadow-[0_30px_90px_-44px_rgba(0,0,0,0.95)]">
            <CardContent className="relative p-6 sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(232,121,249,0.16),transparent_32%)]" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-4">
                  <Badge variant="outline" className="border-white/15 bg-white/[0.05] text-white/85" data-testid="home-final-cta-badge">
                    Portail prêt à explorer
                  </Badge>
                  <h2 className="font-display text-3xl font-black text-white sm:text-4xl" data-testid="home-final-cta-heading">
                    Commence par la landing, puis plonge dans Anime Moments, les news et la boutique.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-white/62" data-testid="home-final-cta-description">
                    Per design guidelines, les CTA principaux utilisent les accents néon existants du projet pour rester cohérents avec l’écosystème visuel déjà en place.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Button asChild size="lg" className="btn-neon-rainbow min-h-[48px] rounded-full px-7 text-white" data-testid="home-final-cta-primary-button">
                    <Link to="/anime-moments">
                      Entrer dans Anime Moments
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="glass" size="lg" className="min-h-[48px] rounded-full border-white/20 bg-white/[0.04] px-7 text-white" data-testid="home-final-cta-secondary-button">
                    <Link to="/actualites">
                      Lire les actualités
                      <Calendar className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-10 grid gap-4 md:grid-cols-4" data-testid="home-product-preview-grid">
            {SHOP_PRODUCTS.slice(0, 4).map((product, index) => (
              <Link
                key={product.id}
                to="/shop"
                className="group"
                data-testid={`home-product-preview-card-${index + 1}`}
              >
                <Card className="overflow-hidden rounded-[1.4rem] border-white/10 bg-white/[0.04] transition-[transform,box-shadow,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-cyan-200/20">
                  <div className="aspect-square overflow-hidden bg-black/20">
                    <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                      <ProductArtwork seed={product.id} category={product.category} label={product.name} />
                    </div>
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <p className="line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
                    <p className="text-xs leading-6 text-white/62">Pièce collector reliée à l’univers visuel Lovanet.</p>
                    <p className="text-sm font-black text-cyan-100">{product.price} €</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
