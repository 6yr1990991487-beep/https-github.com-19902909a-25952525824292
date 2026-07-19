// SEO i18n dictionary — controls the title / description / og:* that Google
// serves in the SERP snippet for each supported UI language. Selection is
// driven by `?hl=<code>` (explicit) or `navigator.language` (implicit).

export const SUPPORTED_LOCALES = ["fr", "en", "es", "de", "it", "pt", "ja", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export type RouteKey =
  | "/"
  | "/anime-moments"
  | "/decouvrir"
  | "/shop"
  | "/anime-catalog"
  | "/anime-countdown"
  | "/chaine-youtube"
  | "/prime-video"
  | "/tiktok"
  | "/actualites"
  | "/contact"
  | "/legals";

export const ROUTES: RouteKey[] = [
  "/",
  "/anime-moments",
  "/decouvrir",
  "/shop",
  "/anime-catalog",
  "/anime-countdown",
  "/chaine-youtube",
  "/prime-video",
  "/tiktok",
  "/actualites",
  "/contact",
  "/legals",
];

type Meta = { title: string; description: string };

// Unified description per locale — same on every route. Contains the three
// mandatory brand keywords (anime, AnimeMoments, Animer officiel) and drops
// all em-dashes so Google's SERP snippet never renders "—".
const UNIFIED_DESC: Record<Locale, string> = {
  fr: "Anime.Moments.officiel : Lovanet Plateforme officielle. Anime, AnimeMoments, Animer officiel : vidéos YouTube, TikTok, Prime Video, catalogue et boutique manga.",
  en: "Anime.Moments.officiel : Lovanet Official Platform. Anime, AnimeMoments, Animer officiel : YouTube videos, TikTok, Prime Video, anime catalog and manga shop.",
  es: "Anime.Moments.officiel : Lovanet Plataforma oficial. Anime, AnimeMoments, Animer officiel : vídeos YouTube, TikTok, Prime Video, catálogo y tienda manga.",
  de: "Anime.Moments.officiel : Lovanet Offizielle Plattform. Anime, AnimeMoments, Animer officiel : YouTube-Videos, TikTok, Prime Video, Anime-Katalog und Manga-Shop.",
  it: "Anime.Moments.officiel : Lovanet Piattaforma ufficiale. Anime, AnimeMoments, Animer officiel : video YouTube, TikTok, Prime Video, catalogo e shop manga.",
  pt: "Anime.Moments.officiel : Lovanet Plataforma oficial. Anime, AnimeMoments, Animer officiel : vídeos YouTube, TikTok, Prime Video, catálogo e loja manga.",
  ja: "Anime.Moments.officiel : Lovanet 公式プラットフォーム。Anime、AnimeMoments、Animer officiel：YouTube 動画、TikTok、Prime Video、アニメカタログとマンガショップ。",
  zh: "Anime.Moments.officiel : Lovanet 官方平台。Anime、AnimeMoments、Animer officiel：YouTube 视频、TikTok、Prime Video、动漫目录与漫画商店。",
};

// Titles use " : " as separator (never em-dash). Homepage title matches the
// exact wording requested by the brand.
const TITLES: Record<Locale, Record<RouteKey, string>> = {
  fr: {
    "/": "Lovanet : portail anime manga futuriste",
    "/anime-moments": "Anime.Moments.officiel : expérience immersive Lovanet",
    "/decouvrir": "Discover Lovanet : Univers anime, vidéos et boutique",
    "/shop": "Boutique Lovanet : Posters, collectors et vêtements anime",
    "/anime-catalog": "Catalogue Anime : 1500+ animés avec trailers",
    "/anime-countdown": "Anime à venir : Countdown live des sorties",
    "/chaine-youtube": "YouTube : AnimeMoments chaîne officielle anime",
    "/prime-video": "Prime Video : Anime.Moments.officiel streaming",
    "/tiktok": "TikTok : Anime.Moments.officiel shorts anime",
    "/actualites": "Actualités Anime : nouveautés vidéos, produits et manga",
    "/contact": "Contact : Lovanet Anime.Moments.officiel",
    "/legals": "Mentions légales : Lovanet Anime.Moments.officiel",
  },
  en: {
    "/": "Lovanet : futuristic anime manga portal",
    "/anime-moments": "Anime.Moments.officiel : Lovanet immersive experience",
    "/decouvrir": "Discover Lovanet : anime universe, videos and shop",
    "/shop": "Lovanet Shop : anime posters, collectors and apparel",
    "/anime-catalog": "Anime Catalog : 1500+ shows with trailers",
    "/anime-countdown": "Upcoming Anime : Live release countdown",
    "/chaine-youtube": "YouTube : AnimeMoments official anime channel",
    "/prime-video": "Prime Video : Anime.Moments.officiel streaming",
    "/tiktok": "TikTok : Anime.Moments.officiel anime shorts",
    "/actualites": "Anime News : videos, products and manga updates",
    "/contact": "Contact : Lovanet Anime.Moments.officiel",
    "/legals": "Legal notice : Lovanet Anime.Moments.officiel",
  },
  es: {
    "/": "Lovanet : portal futurista de anime y manga",
    "/anime-moments": "Anime.Moments.officiel : experiencia inmersiva Lovanet",
    "/decouvrir": "Discover Lovanet : universo anime, vídeos y tienda",
    "/shop": "Tienda Lovanet : pósteres, coleccionables y ropa anime",
    "/anime-catalog": "Catálogo Anime : 1500+ series con tráilers",
    "/anime-countdown": "Próximos anime : cuenta atrás en directo",
    "/chaine-youtube": "YouTube : AnimeMoments canal oficial anime",
    "/prime-video": "Prime Video : Anime.Moments.officiel streaming",
    "/tiktok": "TikTok : Anime.Moments.officiel shorts anime",
    "/actualites": "Noticias Anime : novedades de vídeos, productos y manga",
    "/contact": "Contacto : Lovanet Anime.Moments.officiel",
    "/legals": "Aviso legal : Lovanet Anime.Moments.officiel",
  },
  de: {
    "/": "Lovanet : futuristisches Anime- und Manga-Portal",
    "/anime-moments": "Anime.Moments.officiel : immersive Lovanet-Erfahrung",
    "/decouvrir": "Discover Lovanet : Anime-Universum, Videos und Shop",
    "/shop": "Lovanet Shop : Anime-Poster, Sammlerstuecke und Kleidung",
    "/anime-catalog": "Anime-Katalog : 1500+ Serien mit Trailern",
    "/anime-countdown": "Kommende Anime : Live-Countdown",
    "/chaine-youtube": "YouTube : AnimeMoments offizieller Anime-Kanal",
    "/prime-video": "Prime Video : Anime.Moments.officiel Streaming",
    "/tiktok": "TikTok : Anime.Moments.officiel Anime-Shorts",
    "/actualites": "Anime News : Videos, Produkte und Manga Updates",
    "/contact": "Kontakt : Lovanet Anime.Moments.officiel",
    "/legals": "Impressum : Lovanet Anime.Moments.officiel",
  },
  it: {
    "/": "Lovanet : portale futuristico anime e manga",
    "/anime-moments": "Anime.Moments.officiel : esperienza immersiva Lovanet",
    "/decouvrir": "Discover Lovanet : universo anime, video e shop",
    "/shop": "Shop Lovanet : poster, collector e abbigliamento anime",
    "/anime-catalog": "Catalogo Anime : 1500+ serie con trailer",
    "/anime-countdown": "Anime in arrivo : countdown live",
    "/chaine-youtube": "YouTube : AnimeMoments canale ufficiale anime",
    "/prime-video": "Prime Video : Anime.Moments.officiel streaming",
    "/tiktok": "TikTok : Anime.Moments.officiel shorts anime",
    "/actualites": "News Anime : novità video, prodotti e manga",
    "/contact": "Contatti : Lovanet Anime.Moments.officiel",
    "/legals": "Note legali : Lovanet Anime.Moments.officiel",
  },
  pt: {
    "/": "Lovanet : portal futurista de anime e manga",
    "/anime-moments": "Anime.Moments.officiel : experiência imersiva Lovanet",
    "/decouvrir": "Discover Lovanet : universo anime, vídeos e loja",
    "/shop": "Loja Lovanet : pôsteres, colecionáveis e roupas anime",
    "/anime-catalog": "Catálogo Anime : 1500+ séries com trailers",
    "/anime-countdown": "Próximos anime : contagem regressiva ao vivo",
    "/chaine-youtube": "YouTube : AnimeMoments canal oficial anime",
    "/prime-video": "Prime Video : Anime.Moments.officiel streaming",
    "/tiktok": "TikTok : Anime.Moments.officiel shorts anime",
    "/actualites": "Notícias Anime : novidades de vídeos, produtos e manga",
    "/contact": "Contato : Lovanet Anime.Moments.officiel",
    "/legals": "Aviso legal : Lovanet Anime.Moments.officiel",
  },
  ja: {
    "/": "Lovanet : 未来的なアニメ・マンガポータル",
    "/anime-moments": "Anime.Moments.officiel : Lovanet 没入体験",
    "/decouvrir": "Discover Lovanet : アニメの世界・動画・ショップ",
    "/shop": "Lovanet ショップ : アニメポスター・コレクション・アパレル",
    "/anime-catalog": "アニメカタログ : 1500本以上・予告編付き",
    "/anime-countdown": "配信予定アニメ : ライブ カウントダウン",
    "/chaine-youtube": "YouTube : AnimeMoments 公式アニメチャンネル",
    "/prime-video": "Prime Video : Anime.Moments.officiel 配信",
    "/tiktok": "TikTok : Anime.Moments.officiel アニメショート",
    "/actualites": "アニメニュース : 動画・商品・マンガ最新情報",
    "/contact": "お問い合わせ : Lovanet Anime.Moments.officiel",
    "/legals": "法的通知 : Lovanet Anime.Moments.officiel",
  },
  zh: {
    "/": "Lovanet : 未来感动漫漫画门户",
    "/anime-moments": "Anime.Moments.officiel : Lovanet 沉浸式体验",
    "/decouvrir": "Discover Lovanet : 动漫世界、视频与商店",
    "/shop": "Lovanet 商店 : 动漫海报、收藏品与服饰",
    "/anime-catalog": "动漫目录 : 1500+ 部作品含预告",
    "/anime-countdown": "即将上线动漫 : 实时倒计时",
    "/chaine-youtube": "YouTube : AnimeMoments 官方动漫频道",
    "/prime-video": "Prime Video : Anime.Moments.officiel 流媒体",
    "/tiktok": "TikTok : Anime.Moments.officiel 动漫短片",
    "/actualites": "动漫新闻 : 视频、商品与漫画更新",
    "/contact": "联系我们 : Lovanet Anime.Moments.officiel",
    "/legals": "法律声明 : Lovanet Anime.Moments.officiel",
  },
};

function buildLocale(locale: Locale): Record<RouteKey, Meta> {
  const desc = UNIFIED_DESC[locale];
  const out = {} as Record<RouteKey, Meta>;
  for (const r of ROUTES) out[r] = { title: TITLES[locale][r], description: desc };
  return out;
}

export const SEO_I18N: Record<Locale, Record<RouteKey, Meta>> = {
  fr: buildLocale("fr"),
  en: buildLocale("en"),
  es: buildLocale("es"),
  de: buildLocale("de"),
  it: buildLocale("it"),
  pt: buildLocale("pt"),
  ja: buildLocale("ja"),
  zh: buildLocale("zh"),
};

export const HREFLANG_MAP: Record<Locale, string> = {
  fr: "fr", en: "en", es: "es", de: "de", it: "it", pt: "pt", ja: "ja", zh: "zh",
};

export function detectLocale(search: string, navLang: string | undefined): Locale {
  const params = new URLSearchParams(search);
  const hl = params.get("hl")?.toLowerCase();
  if (hl && (SUPPORTED_LOCALES as readonly string[]).includes(hl)) return hl as Locale;
  const nav = (navLang || "").slice(0, 2).toLowerCase();
  if ((SUPPORTED_LOCALES as readonly string[]).includes(nav)) return nav as Locale;
  return DEFAULT_LOCALE;
}

export function normalizeRoute(pathname: string): RouteKey {
  let key = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const parts = key.split("/").filter(Boolean);
  if (parts.length > 0 && (SUPPORTED_LOCALES as readonly string[]).includes(parts[0].toLowerCase())) {
    key = "/" + parts.slice(1).join("/");
    if (key === "/") return "/";
  }
  if (key.startsWith("/actualites/")) return "/actualites";
  return (ROUTES.includes(key as RouteKey) ? (key as RouteKey) : "/");
}

export function localeFromPathname(pathname: string): Locale | null {
  const parts = pathname.split("?")[0].split("/").filter(Boolean);
  const first = parts[0]?.toLowerCase();
  if (first && (SUPPORTED_LOCALES as readonly string[]).includes(first)) return first as Locale;
  return null;
}

export function metaFor(locale: Locale, route: RouteKey): Meta {
  return SEO_I18N[locale][route] ?? SEO_I18N[DEFAULT_LOCALE][route];
}
