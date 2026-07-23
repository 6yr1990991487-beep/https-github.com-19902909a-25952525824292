import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  SUPPORTED_LOCALES,
  HREFLANG_MAP,
  DEFAULT_LOCALE,
  detectLocale,
  localeFromPathname,
  normalizeRoute,
  metaFor,
} from "@/lib/seoI18n";

const PRIMARY_SITE = "https://lovanet.fr";
const ALTERNATE_SITES = ["https://animemomentsofficiel.fr", "https://animeofficiel.fr"];
const OG_IMAGE = `${PRIMARY_SITE}/lovanet-og.svg`;
const LOGO = `${PRIMARY_SITE}/lovanet-logo-custom.png`;

const KEYWORDS = [
  "anime",
  "AnimeMoments",
  "Animer officiel",
  "Anime.Moments.officiel",
  "AnimemomentsAnimeofficiel",
  "Lovanet",
  "animeofficiel.fr",
  "animemomentsofficiel.fr",
  "manga animé",
  "catalogue anime",
  "boutique manga",
  "vidéos anime",
  "YouTube anime",
  "TikTok anime",
  "Prime Video anime",
  "actualités anime",
  "poster anime",
  "figurine anime",
  "manga",
].join(", ");

function localizedPath(route: string, locale: string) {
  const suffix = route === "/" ? "" : route;
  return locale === DEFAULT_LOCALE ? `${suffix || "/"}` : `/${locale}${suffix}`;
}

function breadcrumbFor(route: string, canonical: string) {
  const labels: Record<string, string> = {
    "/": "Portail Lovanet",
    "/anime-moments": "Anime Moments",
    "/decouvrir": "Univers Lovanet",
    "/shop": "Boutique",
    "/anime-catalog": "Catalogue Anime",
    "/anime-countdown": "Anime à venir",
    "/chaine-youtube": "YouTube",
    "/prime-video": "Prime Video",
    "/tiktok": "TikTok",
    "/actualites": "Actualités",
    "/contact": "Contact",
    "/legals": "Mentions légales",
  };
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Lovanet", item: `${PRIMARY_SITE}/` },
      ...(route === "/"
        ? []
        : [{ "@type": "ListItem", position: 2, name: labels[route] || "Page Lovanet", item: canonical }]),
    ],
  };
}

export function LocalizedHead() {
  const location = useLocation();
  const navLang = typeof navigator !== "undefined" ? navigator.language : undefined;
  const pathLocale = localeFromPathname(location.pathname);
  const locale = pathLocale ?? detectLocale(location.search, navLang);
  const route = normalizeRoute(location.pathname);
  const seoParams = new URLSearchParams(location.search);
  const isShopPage = location.pathname.includes("/shop");
  const isVideoPage = location.pathname.includes("/lecteurs-video");
  const isCatalogPage = location.pathname.includes("/anime-catalog");
  const isActualitesPage = location.pathname.includes("/actualites");
  const deepSeoParam = isShopPage
    ? seoParams.get("product")
    : isVideoPage
      ? seoParams.get("video")
      : isCatalogPage
        ? seoParams.get("anime")
        : null;
  const deepSeoKey = isShopPage ? "product" : isVideoPage ? "video" : isCatalogPage ? "anime" : null;
  const deepSeoQuery = deepSeoParam && deepSeoKey ? `?${deepSeoKey}=${encodeURIComponent(deepSeoParam)}` : "";
  const { title, description } = metaFor(locale, route);
  const canonicalPath = localizedPath(route, locale);
  const canonical = `${PRIMARY_SITE}${canonicalPath}${deepSeoQuery}`;
  const alternateCanonicals = ALTERNATE_SITES.map((site) => `${site}${canonicalPath}${deepSeoQuery}`);

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${PRIMARY_SITE}/#organization`,
        name: "Lovanet Anime.Moments.officiel",
        alternateName: ["AnimemomentsAnimeofficiel", "Anime Moments Officiel", "Animer officiel"],
        url: PRIMARY_SITE,
        logo: LOGO,
        image: OG_IMAGE,
        sameAs: [
          "https://www.youtube.com/@animemomentsanimeofficiel",
          "https://www.tiktok.com/@anime.moments.officiel",
          ...ALTERNATE_SITES,
        ],
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "1284", bestRating: "5" },
        review: {
          "@type": "Review",
          name: "Avis éditorial Lovanet",
          reviewBody: "Plateforme anime complète réunissant vidéos, catalogue, boutique manga et actualités Anime.Moments.officiel.",
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          author: { "@type": "Organization", name: "Lovanet" },
        },
      },
      {
        "@type": "WebSite",
        "@id": `${PRIMARY_SITE}/#website`,
        url: PRIMARY_SITE,
        name: "Lovanet",
        description,
        inLanguage: HREFLANG_MAP[locale],
        publisher: { "@id": `${PRIMARY_SITE}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${PRIMARY_SITE}/anime-catalog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        name: title,
        headline: title,
        description,
        url: canonical,
        image: OG_IMAGE,
        inLanguage: HREFLANG_MAP[locale],
        isPartOf: { "@id": `${PRIMARY_SITE}/#website` },
        primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE },
        dateModified: new Date().toISOString(),
      },
      breadcrumbFor(route, canonical),
    ],
  };

  const pageOwnsCoreSeo = isActualitesPage || route === "/actualites" || (isCatalogPage && !!deepSeoParam);

  return (
    <Helmet>
      <html lang={HREFLANG_MAP[locale]} />
      <title>{title}</title>
      {!pageOwnsCoreSeo && <meta name="description" key="localized-description" content={description} />}
      <meta name="keywords" content={KEYWORDS} />
      <meta name="robots" content="index,follow,max-image-preview:large,max-video-preview:-1,max-snippet:-1" />
      <meta name="googlebot" content="index,follow,max-image-preview:large,max-video-preview:-1,max-snippet:-1" />
      <meta name="author" content="Lovanet Anime.Moments.officiel" />
      <meta name="publisher" content="Lovanet" />
      <meta name="news_keywords" content="anime, manga, AnimeMoments, Lovanet, YouTube anime, TikTok anime, Prime Video anime" />
      <meta name="alternate-domains" content={ALTERNATE_SITES.join(", ")} />
      {!pageOwnsCoreSeo && <link rel="canonical" href={canonical} />}
      {alternateCanonicals.map((href) => (
        <link key={`domain-alt-${href}`} rel="alternate" href={href} />
      ))}
      <link rel="alternate" type="application/rss+xml" title="Lovanet Actualités RSS" href={`${PRIMARY_SITE}/rss.xml`} />
      <link rel="alternate" type="application/atom+xml" title="Lovanet Actualités Atom" href={`${PRIMARY_SITE}/atom.xml`} />
      <link rel="sitemap" type="application/xml" href={`${PRIMARY_SITE}/sitemap.xml`} />
      <meta property="og:site_name" content="Lovanet" />
      <meta property="og:type" content={route === "/actualites" ? "article" : "website"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:secure_url" content={OG_IMAGE} />
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={
        locale === "fr" ? "fr_FR"
        : locale === "en" ? "en_US"
        : locale === "es" ? "es_ES"
        : locale === "de" ? "de_DE"
        : locale === "it" ? "it_IT"
        : locale === "pt" ? "pt_BR"
        : locale === "ja" ? "ja_JP"
        : "zh_CN"
      } />
      {SUPPORTED_LOCALES.filter((l) => l !== locale).map((l) => (
        <meta key={`ogalt-${l}`} property="og:locale:alternate" content={
          l === "fr" ? "fr_FR"
          : l === "en" ? "en_US"
          : l === "es" ? "es_ES"
          : l === "de" ? "de_DE"
          : l === "it" ? "it_IT"
          : l === "pt" ? "pt_BR"
          : l === "ja" ? "ja_JP"
          : "zh_CN"
        } />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {SUPPORTED_LOCALES.map((l) => (
        <link key={`hreflang-${l}`} rel="alternate" hrefLang={HREFLANG_MAP[l]} href={`${PRIMARY_SITE}${localizedPath(route, l)}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${PRIMARY_SITE}${route === "/" ? "/" : route}`} />
      <script type="application/ld+json">{JSON.stringify(graph)}</script>
    </Helmet>
  );
}
