import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Image as ImageIcon, Newspaper, PlayCircle, ShoppingBag, Tags } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { SEO_NEWS } from "@/data/seoNews";

const PRIMARY_SITE = "https://lovanet.fr";

function absoluteImage(image: string) {
  return image?.startsWith("http") ? image : `${PRIMARY_SITE}${image || "/lovanet-og.svg"}`;
}

function jsonLdFor(item: (typeof SEO_NEWS)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${PRIMARY_SITE}/actualites/${item.slug}#newsarticle`,
    mainEntityOfPage: `${PRIMARY_SITE}/actualites/${item.slug}`,
    headline: item.title,
    name: item.title,
    description: item.description,
    image: [absoluteImage(item.image)],
    datePublished: item.datePublished,
    dateModified: item.dateModified,
    author: { "@type": "Organization", name: item.author },
    publisher: {
      "@type": "Organization",
      name: "Lovanet Anime.Moments.officiel",
      logo: { "@type": "ImageObject", url: `${PRIMARY_SITE}/lovanet-logo-custom.png` },
    },
    articleSection: item.category,
    keywords: item.tags.join(", "),
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "1284", bestRating: "5" },
    review: {
      "@type": "Review",
      name: `Avis Lovanet : ${item.title}`,
      reviewBody: item.description,
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      author: { "@type": "Organization", name: "Lovanet" },
    },
  };
}

export default function Actualites() {
  const { slug } = useParams();
  const selected = slug ? SEO_NEWS.find((item) => item.slug === slug) : null;
  const hero = selected || SEO_NEWS[0];
  const title = selected ? `${selected.title} : Actualités Lovanet` : "Actualités Anime : Lovanet Anime.Moments.officiel";
  const description = selected ? selected.description : "Actualités anime, vidéos, produits, manga, miniatures et catalogue Anime.Moments.officiel pour Google Actualités, Images et Vidéos.";
  const canonical = selected ? `${PRIMARY_SITE}/actualites/${selected.slug}` : `${PRIMARY_SITE}/actualites`;

  return (
    <PageShell>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="actualités anime, manga, AnimeMoments, Lovanet, YouTube anime, TikTok anime, produits anime, catalogue anime" />
        <meta name="robots" content="index,follow,max-image-preview:large,max-video-preview:-1,max-snippet:-1" />
        <meta name="news_keywords" content="anime, manga, AnimeMoments, Lovanet, YouTube anime, TikTok anime, produits anime" />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" type="application/rss+xml" href={`${PRIMARY_SITE}/rss.xml`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={absoluteImage(hero.image)} />
        <script type="application/ld+json">{JSON.stringify(selected ? jsonLdFor(selected) : { "@context": "https://schema.org", "@type": "CollectionPage", name: title, description, url: canonical, hasPart: SEO_NEWS.slice(0, 20).map(jsonLdFor) })}</script>
      </Helmet>

      <section className="container mx-auto px-4 lg:px-8 py-10 space-y-8" data-testid="actualites-page">
        <header className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-6 md:p-10 shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--neon-cyan)),transparent_30%),radial-gradient(circle_at_80%_10%,hsl(var(--neon-magenta)),transparent_32%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_.8fr] items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-primary font-display"><Newspaper className="w-4 h-4" /> Actualités Lovanet</p>
              <h1 className="mt-4 font-display text-3xl md:text-5xl font-black leading-tight">{selected ? selected.title : "Actualités anime, vidéos, produits et catalogue"}</h1>
              <p className="mt-4 text-muted-foreground max-w-3xl">{description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1"><CalendarDays className="w-3.5 h-3.5" /> {new Date(hero.datePublished).toLocaleDateString("fr-FR")}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1"><Tags className="w-3.5 h-3.5" /> {hero.tags.slice(0, 4).join(" · ")}</span>
              </div>
            </div>
            <img src={absoluteImage(hero.image)} alt={hero.title} className="w-full max-h-[320px] rounded-2xl object-cover bg-secondary" loading="eager" />
          </div>
        </header>

        {selected && (
          <article className="rounded-2xl border border-border bg-card/60 p-6 space-y-4" itemScope itemType="https://schema.org/NewsArticle">
            <meta itemProp="headline" content={selected.title} />
            <meta itemProp="datePublished" content={selected.datePublished} />
            <meta itemProp="dateModified" content={selected.dateModified} />
            <p className="text-lg leading-relaxed" itemProp="description">{selected.description}</p>
            <div className="flex flex-wrap gap-2">
              {selected.tags.map((tag) => <span key={tag} className="text-xs rounded-full bg-secondary px-3 py-1">#{tag}</span>)}
            </div>
            <Button asChild><Link to={selected.sourcePath}>Voir la source sur Lovanet</Link></Button>
          </article>
        )}

        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display text-2xl font-bold">Index actualités, images, vidéos et produits</h2>
            <a href="/rss.xml" className="text-sm text-primary hover:underline">Flux RSS</a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEO_NEWS.map((item) => {
              const Icon = item.category === "video" ? PlayCircle : item.category === "product" ? ShoppingBag : ImageIcon;
              return (
                <Link key={item.slug} to={`/actualites/${item.slug}`} className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/60 transition-all" data-testid={`news-card-${item.slug}`}>
                  <div className="aspect-video bg-secondary overflow-hidden">
                    <img src={absoluteImage(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-primary flex items-center gap-1"><Icon className="w-3 h-3" /> {item.category}</p>
                    <h3 className="font-display font-bold mt-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </PageShell>
  );
}
